#!/usr/bin/env python3
"""
Read a PPTX file and output the content bounding box for each slide as JSON.

The bounding box is the union rectangle of all visible shapes on each slide.
All coordinate values are in EMUs (English Metric Units), clamped to slide area.

Usage:
  python ppt_bounds.py <file.pptx>
"""

import sys
import json
import zipfile
from lxml import etree

NSMAP = {
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
}

# Shape element local names that can carry position/size in a spTree
SHAPE_TAGS = {'sp', 'pic', 'grpSp', 'graphicFrame', 'cxnSp'}


def qn(tag):
    if ':' in tag:
        ns, name = tag.split(':', 1)
        return '{%s}%s' % (NSMAP[ns], name)
    return tag


def _get_xfrm(el):
    """Find the first a:xfrm descendant, regardless of nesting depth."""
    return el.find('.//' + qn('a:xfrm'))


def get_content_bounds(pptx_path):
    with zipfile.ZipFile(pptx_path) as zf:
        pres_xml = etree.parse(zf.open('ppt/presentation.xml'))
        sldSz = pres_xml.find(qn('p:sldSz'))
        slide_w = int(sldSz.get('cx', 0))
        slide_h = int(sldSz.get('cy', 0))

        slides = sorted([
            f for f in zf.namelist()
            if f.startswith('ppt/slides/slide') and f.endswith('.xml')
        ])

        result = []
        for slide_path in slides:
            tree = etree.parse(zf.open(slide_path))

            min_x = float('inf')
            min_y = float('inf')
            max_x = float('-inf')
            max_y = float('-inf')

            for el in tree.iter():
                if etree.QName(el).localname not in SHAPE_TAGS:
                    continue
                xfrm = _get_xfrm(el)
                if xfrm is None:
                    continue
                off = xfrm.find(qn('a:off'))
                ext = xfrm.find(qn('a:ext'))
                if off is None or ext is None:
                    continue
                x = int(off.get('x', 0))
                y = int(off.get('y', 0))
                w = int(ext.get('cx', 0))
                h = int(ext.get('cy', 0))
                if w <= 0 or h <= 0:
                    continue

                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x + w)
                max_y = max(max_y, y + h)

            if min_x == float('inf'):
                result.append(None)
            else:
                # Clamp to slide area
                result.append({
                    'x': max(0, int(min_x)),
                    'y': max(0, int(min_y)),
                    'w': min(slide_w - max(0, int(min_x)), int(max_x - min_x)),
                    'h': min(slide_h - max(0, int(min_y)), int(max_y - min_y)),
                })

        return {'slide_w': slide_w, 'slide_h': slide_h, 'slides': result}


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__, file=sys.stderr)
        sys.exit(1)
    try:
        bounds = get_content_bounds(sys.argv[1])
        print(json.dumps(bounds))
    except Exception as e:
        json.dump({'error': str(e)}, sys.stderr)
        sys.exit(1)
