#!/usr/bin/env python3
"""
PPTX 拆分工具：将一页中有多个独立形状的 PPTX 拆分为多个单形状 PPTX。

用法:
    python split_pptx.py <source.pptx> [output_dir]

输出:
    output_dir/ 目录下生成 N 个 PPTX 文件，每个包含一个居中形状
"""

import sys
import os
from copy import deepcopy
from pptx import Presentation
from pptx.util import Emu

def split_pptx(source_path, output_dir):
    prs = Presentation(source_path)
    slide_width = prs.slide_width
    slide_height = prs.slide_height

    os.makedirs(output_dir, exist_ok=True)

    print(f"源文件: {source_path}")
    print(f"共 {len(prs.slides)} 页")

    total = 0
    for slide_idx, slide in enumerate(prs.slides):
        shape_count = len(slide.shapes)
        print(f"\n第 {slide_idx+1} 页: {shape_count} 个形状")

        for shape_idx, shape in enumerate(slide.shapes):
            try:
                new_prs = Presentation()
                new_prs.slide_width = slide_width
                new_prs.slide_height = slide_height

                blank = new_prs.slide_layouts[6]  # blank layout
                new_slide = new_prs.slides.add_slide(blank)

                # Clone shape XML element
                el = deepcopy(shape._element)
                new_slide.shapes._spTree.append(el)

                # Access the newly added shape (last in list)
                new_shape = new_slide.shapes[-1]

                # Center on slide
                new_shape.left = slide_width // 2 - shape.width // 2
                new_shape.top = slide_height // 2 - shape.height // 2

                output_name = f"slide{slide_idx+1:02d}_shape{shape_idx+1:03d}.pptx"
                output_path = os.path.join(output_dir, output_name)
                new_prs.save(output_path)

                total += 1
                if (shape_idx + 1) % 20 == 0:
                    print(f"  已处理 {shape_idx+1}/{shape_count}...")
            except Exception as e:
                print(f"  ✗ shape {shape_idx+1}: {e}")

        print(f"  {shape_count} 个处理完成")

    print(f"\n总计拆分出 {total} 个 PPTX 文件 → {output_dir}/")
    print("下一步: 将这些文件拖入 PPTArts 导入页面即可批量导入")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    src = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else 'split_output'
    split_pptx(src, out)
