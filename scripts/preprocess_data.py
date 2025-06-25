#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# 链家租房数据清洗脚本
# 从本地data目录读取原始CSV数据，进行清洗和标准化，输出到前端public/data目录

import csv
import os
import sys
import datetime
import re
from pathlib import Path

def clean_price(price_str):
    # 清理价格，去掉非数字字符
    if not price_str or price_str == 'null':
        return 0
    price_clean = re.sub(r'[^\d]', '', str(price_str))
    try:
        return int(price_clean) if price_clean else 0
    except:
        return 0

def clean_area(area_str):
    # 提取面积数字
    if not area_str or area_str == 'null':
        return 0
    area_match = re.search(r'(\d+(?:\.\d+)?)', str(area_str))
    if area_match:
        try:
            return float(area_match.group(1))
        except:
            return 0
    return 0

def fix_district(district):
    # 统一区域名称
    if not district or district == 'null':
        return '未知'
    
    districts = {
        "天河": "天河", "越秀": "越秀", "荔湾": "荔湾", "海珠": "海珠",
        "番禺": "番禺", "白云": "白云", "黄埔": "黄埔", "从化": "从化",
        "增城": "增城", "花都": "花都", "南沙": "南沙"
    }
    
    district_clean = district.replace('区', '')
    return districts.get(district_clean, district)

def fix_orientation(orientation):
    # 标准化朝向
    if not orientation or orientation == 'null':
        return '未知'
    
    orientations = ["东", "南", "西", "北", "东南", "东北", "西南", "西北", "南北", "东西"]
    
    for o in orientations:
        if o in orientation:
            return o
    return orientation

def fix_layout(layout):
    # 整理户型格式
    if not layout or layout == 'null':
        return '未知'
    layout = layout.strip()
    if '室' in layout and '厅' in layout:
        return layout
    elif '开间' in layout:
        return '开间'
    return layout

def parse_tags(tags_str):
    # 分割标签字符串
    if not tags_str or tags_str == 'null':
        return []
    tags = [tag.strip() for tag in tags_str.split('|') if tag.strip()]
    return tags

def process_file(input_file, output_file):
    print(f"处理文件: {input_file}")
    
    if not os.path.exists(input_file):
        print(f"文件不存在: {input_file}")
        return 0
    
    data = []
    skipped = 0
    
    with open(input_file, 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        next(reader, None)  # 跳过第一行
        headers = next(reader, None)
        
        if not headers:
            print(f"无法读取表头: {input_file}")
            return 0
        
        for row_num, row in enumerate(reader, start=3):
            if len(row) < 12:
                skipped += 1
                continue
            
            try:
                # 清理各个字段
                title = row[0].strip() if row[0] else '未知'
                district = fix_district(row[1])
                sub_district = row[2].strip() if row[2] else '未知'
                community = row[3].strip() if row[3] else '未知'
                area = clean_area(row[4])
                orientation = fix_orientation(row[5])
                layout = fix_layout(row[6])
                floor_info = row[7].strip() if row[7] else '未知'
                price = clean_price(row[8])
                tags = parse_tags(row[9])
                detail_url = row[10].strip() if row[10] else ''
                update_time = row[11].strip() if row[11] else ''
                
                # 过滤异常数据
                if price <= 0 or area <= 0:
                    skipped += 1
                    continue
                
                if price < 500 or price > 50000:  # 租金合理范围
                    skipped += 1
                    continue
                
                if area < 10 or area > 500:  # 面积合理范围
                    skipped += 1
                    continue
                
                row_data = {
                    'title': title,
                    'district': district,
                    'subDistrict': sub_district,
                    'community': community,
                    'area': area,
                    'orientation': orientation,
                    'layout': layout,
                    'floorInfo': floor_info,
                    'price': price,
                    'tags': tags,
                    'detailUrls': detail_url,
                    'updateTime': update_time
                }
                
                data.append(row_data)
                
            except Exception as e:
                print(f"第{row_num}行出错: {e}")
                skipped += 1
                continue
    
    # 写入文件
    if data:
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        with open(output_file, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.writer(f)
            
            # 写入统计信息
            now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            writer.writerow([f"处理后数量: {len(data)}, 跳过异常: {skipped}, 处理时间: {now}"])
            
            # 写入表头
            writer.writerow(["标题", "区域", "地块", "小区", "面积", "朝向", "户型", "楼层信息", "价格", "标签", "详情页链接", "维护时间"])
            
            # 写入数据
            for item in data:
                writer.writerow([
                    item['title'], item['district'], item['subDistrict'], item['community'],
                    item['area'], item['orientation'], item['layout'], item['floorInfo'],
                    item['price'], '|'.join(item['tags']), item['detailUrls'], item['updateTime']
                ])
        
        print(f"完成: {len(data)} 条数据，跳过 {skipped} 条")
        return len(data)
    else:
        print("没有有效数据")
        return 0

def main():
    print("开始处理数据...")
    
    # 设置路径
    data_dir = Path(__file__).parent.parent / "data"
    output_dir = Path(__file__).parent.parent / "ui" / "data"
    
    print(f"输入: {data_dir}")
    print(f"输出: {output_dir}")
    
    if not data_dir.exists():
        print(f"数据目录不存在: {data_dir}")
        return
    
    # 找到所有csv文件
    csv_files = list(data_dir.glob("houses_*.csv"))
    
    if not csv_files:
        print("没有找到CSV文件")
        return
    
    # 处理每个文件
    total = 0
    for csv_file in csv_files:
        output_file = output_dir / csv_file.name
        count = process_file(csv_file, output_file)
        total += count
        print()
    
    print(f"处理完成！共处理 {total} 条数据")
    print(f"输出目录: {output_dir}")

if __name__ == "__main__":
    main() 