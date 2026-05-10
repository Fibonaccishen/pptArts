#!/usr/bin/env python3
"""
PPTX 拆分工具：将每页中每个独立形状拆分为单独的 PPTX 文件。

通过直接操作 PPTX 内部的 XML（不在 python-pptx 层面删除形状），
避免 LibreOffice 渲染空白的问题。

用法:
    python split_pptx.py <source.pptx> [output_dir] [选项]

选项:
    --list               仅列出所有形状信息（不导出）
    --skip-name "圆角矩形"  跳过名称以指定文字开头的形状
"""

import sys
import os
import zipfile
import shutil
from io import BytesIO
from copy import deepcopy
from lxml import etree

# --- helpers ---
NSMAP = {
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
}

def qn(tag):
    """Resolve a prefix:name to a Clark notation qualified name."""
    if ':' in tag:
        ns, name = tag.split(':', 1)
        return '{%s}%s' % (NSMAP[ns], name)
    return tag

def emu_to_px(emu):
    return round(emu / 12700)

def px_to_emu(px):
    return int(px * 12700)

def _find(el, path):
    """Safe find with namespace prefix resolution."""
    parts = path.split('/')
    result = el
    for part in parts:
        result = result.find(qn(part))
        if result is None:
            return None
    return result

def _get(el, attr, default=''):
    v = el.get(attr)
    return int(v) if v is not None else default

def describe_shape(sp_elm):
    """Return a human-readable shape description from its XML element."""
    name_el = _find(sp_elm, 'p:nvSpPr/p:cNvPr')
    name = name_el.get('name', '') if name_el is not None else ''
    xfrm = _find(sp_elm, 'p:spPr/a:xfrm')
    off = _find(xfrm, 'a:off') if xfrm is not None else None
    ext = _find(xfrm, 'a:ext') if xfrm is not None else None
    x = _get(off, 'x', 0) if off is not None else 0
    y = _get(off, 'y', 0) if off is not None else 0
    w = _get(ext, 'cx', 0) if ext is not None else 0
    h = _get(ext, 'cy', 0) if ext is not None else 0
    tag = etree.QName(sp_elm).localname
    return tag, name, emu_to_px(x), emu_to_px(y), emu_to_px(w), emu_to_px(h)

def list_shapes(source_path):
    """Print all shapes in the PPTX."""
    with zipfile.ZipFile(source_path) as zf:
        slides = sorted([f for f in zf.namelist() if f.startswith('ppt/slides/slide') and f.endswith('.xml')])
        for si, slide_path in enumerate(slides):
            tree = etree.parse(zf.open(slide_path))
            shapes = tree.findall('.//' + qn('p:sp'))
            print(f"\n第 {si+1} 页 ({len(shapes)} 个形状):")
            for i, sp in enumerate(shapes):
                tag, name, x, y, w, h = describe_shape(sp)
                print(f"  [{i+1}] [{tag}] {name} ({w}x{h}px) at ({x},{y})")

def split_pptx(source_path, output_dir, skip_name=None):
    """Split each shape into its own PPTX file."""
    os.makedirs(output_dir, exist_ok=True)

    with zipfile.ZipFile(source_path, 'r') as zf:
        # Read all entries once
        entries = {name: zf.read(name) for name in zf.namelist()}
        slide_paths = sorted([f for f in entries if f.startswith('ppt/slides/slide') and f.endswith('.xml')])
        slide_rels = {f: f.replace('slides/slide', 'slides/_rels/slide') + '.rels'
                      for f in slide_paths}

    total = 0
    for si, slide_path in enumerate(slide_paths):
        slide_xml = entries[slide_path]
        tree = etree.fromstring(slide_xml)
        shapes = tree.findall('.//' + qn('p:sp'))
        print(f"\n第 {si+1} 页: {len(shapes)} 个形状")

        for shape_idx, sp_elm in enumerate(shapes):
            tag, name, x, y, w, h = describe_shape(sp_elm)
            if skip_name and name.startswith(skip_name):
                continue

            try:
                # Copy the shape XML element
                sp_copy = deepcopy(sp_elm)

                # Build new slide XML with just this one shape
                new_tree = deepcopy(tree)
                # Remove all shapes from the new tree's shape tree
                sp_tree = new_tree.find('.//' + qn('p:spTree'))
                if sp_tree is None:
                    continue
                for child in list(sp_tree):
                    sp_tree.remove(child)
                sp_tree.append(sp_copy)

                # Reposition shape to padding area
                PAD = 120 * 12700
                xfrm = _find(sp_copy, 'p:spPr/a:xfrm')
                if xfrm is None:
                    xfrm = sp_copy.find(qn('a:xfrm'))
                if xfrm is not None:
                    off = xfrm.find(qn('a:off'))
                    if off is not None:
                        off.set('x', str(PAD))
                        off.set('y', str(PAD))

                # Resize slide to fit shape + padding (minimum 640px)
                MIN_W = 640 * 12700
                MIN_H = 640 * 12700
                new_w = max(w * 12700 + PAD * 2, MIN_W)
                new_h = max(h * 12700 + PAD * 2, MIN_H)
                sSz = _find(new_tree, 'p:cSld/p:spTree')
                if sSz is not None:
                    sSz = sSz.getparent()
                if sSz is None:
                    sSz = new_tree
                sSz.set('cx', str(new_w))
                sSz.set('cy', str(new_h))

                new_slide_xml = etree.tostring(new_tree, xml_declaration=True, encoding='UTF-8', standalone=True)

                # Build new PPTX
                new_buf = BytesIO()
                with zipfile.ZipFile(new_buf, 'w', zipfile.ZIP_DEFLATED) as out_zf:
                    # Copy all non-slide entries from original
                    overwrite = {'[Content_Types].xml', 'ppt/presentation.xml',
                                 'ppt/_rels/presentation.xml.rels'}
                    base_name = os.path.splitext(os.path.basename(slide_path))[0]
                    new_slide_name = f'ppt/slides/{base_name}.xml'
                    overwrite.add(new_slide_name)
                    rel_path = slide_rels.get(slide_path, '')
                    if rel_path:
                        overwrite.add(rel_path)

                    for entry_name, data in entries.items():
                        if entry_name.startswith('ppt/slides/') and entry_name not in overwrite:
                            continue
                        if entry_name in overwrite:
                            continue
                        out_zf.writestr(entry_name, data)

                    # Write the single new slide
                    out_zf.writestr(new_slide_name, new_slide_xml)

                    # Write slide relationships
                    if rel_path and rel_path in entries:
                        out_zf.writestr(rel_path, entries[rel_path])

                    # Update [Content_Types].xml to only include one slide
                    ct_xml = entries.get('[Content_Types].xml', b'')
                    if ct_xml:
                        ct_tree = etree.fromstring(ct_xml)
                        # Remove other slide overrides
                        for ov in ct_tree.findall('{http://schemas.openxmlformats.org/package/2006/content-types}Override'):
                            part = ov.get('PartName', '')
                            if '/slides/slide' in part and f'/{base_name}.xml' not in part:
                                ov.getparent().remove(ov)
                        out_zf.writestr('[Content_Types].xml', etree.tostring(ct_tree, xml_declaration=True, encoding='UTF-8', standalone=True))

                    # Update ppt/presentation.xml to only reference one slide
                    pres_xml = entries.get('ppt/presentation.xml', b'')
                    if pres_xml:
                        pres_tree = etree.fromstring(pres_xml)
                        sldIdLst = pres_tree.find(qn('p:sldIdLst'))
                        if sldIdLst is not None:
                            for sldId in list(sldIdLst):
                                sldIdLst.remove(sldId)
                            new_sldId = etree.SubElement(sldIdLst, qn('p:sldId'))
                            new_sldId.set('id', '256')
                            new_sldId.set(qn('r:id'), 'rId1')
                        out_zf.writestr('ppt/presentation.xml', etree.tostring(pres_tree, xml_declaration=True, encoding='UTF-8', standalone=True))

                    # Update ppt/_rels/presentation.xml.rels to only reference one slide
                    pres_rels = entries.get('ppt/_rels/presentation.xml.rels', b'')
                    if pres_rels:
                        rels_tree = etree.fromstring(pres_rels)
                        for rel in list(rels_tree):
                            rtype = rel.get('Type', '')
                            if 'slide' in rtype and 'slideLayout' not in rtype and 'slideMaster' not in rtype:
                                rels_tree.remove(rel)
                        new_rel = etree.SubElement(rels_tree, 'Relationship')
                        new_rel.set('Id', 'rId1')
                        new_rel.set('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide')
                        new_rel.set('Target', f'slides/{base_name}.xml')
                        out_zf.writestr('ppt/_rels/presentation.xml.rels', etree.tostring(rels_tree, xml_declaration=True, encoding='UTF-8', standalone=True))

                output_name = f"slide{si+1:02d}_shape{shape_idx+1:03d}.pptx"
                with open(os.path.join(output_dir, output_name), 'wb') as f:
                    f.write(new_buf.getvalue())

                total += 1
                if total % 20 == 0:
                    print(f"  已导出 {total} 个...")
            except Exception as e:
                print(f"  ✗ shape {shape_idx+1}: {e}")

    print(f"\n总计: 导出 {total} 个 → {output_dir}/")

def parse_args():
    args = {'skip_name': None, 'list_only': False}
    i = 2
    while i < len(sys.argv):
        a = sys.argv[i]
        if a == '--list':
            args['list_only'] = True
            i += 1
        elif a == '--skip-name' and i + 1 < len(sys.argv):
            args['skip_name'] = sys.argv[i + 1]
            i += 2
        else:
            i += 1
    return args

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    src = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith('--') else 'split_output'
    opts = parse_args()

    if opts['list_only']:
        list_shapes(src)
    else:
        split_pptx(src, out, skip_name=opts['skip_name'])

    print("\n下一步: 将这些 .pptx 文件拖入 PPTArts 导入页面批量导入")
