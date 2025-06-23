#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# 广州链家租房数据预处理脚本
# 从本地data目录读取原始CSV数据，进行清洗和标准化，输出到前端public/data目录

import csv
import os
import sys
import datetime
import re
from pathlib import Path

# 区域名称标准化映射
DISTRICT_MAPPING = {
    "天河": "天河",
    "越秀": "越秀", 
    "荔湾": "荔湾",
    "海珠": "海珠",
    "番禺": "番禺",
    "白云": "白云",
    "黄埔": "黄埔",
    "从化": "从化",
    "增城": "增城",
    "花都": "花都",
    "南沙": "南沙"
}

# 朝向标准化映射
ORIENTATION_MAPPING = {
    "东": "东",
    "南": "南", 
    "西": "西",
    "北": "北",
    "东南": "东南",
    "东北": "东北",
    "西南": "西南",
    "西北": "西北",
    "南北": "南北",
    "东西": "东西"
}

def clean_price(price_str):
    # 清洗价格数据
    if not price_str or price_str == 'null':
        return 0
    
    # 移除非数字字符，保留数字
    price_clean = re.sub(r'[^\d]', '', str(price_str))
    
    try:
        return int(price_clean) if price_clean else 0
    except ValueError:
        return 0

def clean_area(area_str):
    # 清洗面积数据
    if not area_str or area_str == 'null':
        return 0
    
    # 提取数字部分
    area_match = re.search(r'(\d+(?:\.\d+)?)', str(area_str))
    if area_match:
        try:
            return float(area_match.group(1))
        except ValueError:
            return 0
    return 0

def standardize_district(district):
    # 标准化区域名称
    if not district or district == 'null':
        return '未知'
    
    # 移除"区"字后缀进行匹配
    district_clean = district.replace('区', '')
    return DISTRICT_MAPPING.get(district_clean, district)

def standardize_orientation(orientation):
    # 标准化朝向
    if not orientation or orientation == 'null':
        return '未知'
    
    # 简单的朝向匹配
    for key, value in ORIENTATION_MAPPING.items():
        if key in orientation:
            return value
    
    return orientation

def clean_layout(layout):
    # 清洗户型数据
    if not layout or layout == 'null':
        return '未知'
    
    # 标准化户型格式
    layout = layout.strip()
    
    # 处理常见的户型格式
    if '室' in layout and '厅' in layout:
        return layout
    elif '开间' in layout:
        return '开间'
    
    return layout

def parse_tags(tags_str):
    # 解析标签字符串
    if not tags_str or tags_str == 'null':
        return []
    
    # 分割标签并清洗
    tags = [tag.strip() for tag in tags_str.split('|') if tag.strip()]
    return tags

def preprocess_house_data(input_file, output_file):
    # 预处理单个房源数据文件
    print(f"处理文件: {input_file}")
    
    if not os.path.exists(input_file):
        print(f"警告: 文件不存在 {input_file}")
        return 0
    
    processed_data = []
    skip_count = 0
    
    with open(input_file, 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        
        # 跳过元数据行（第一行包含爬取信息）
        next(reader, None)
        
        # 读取表头
        headers = next(reader, None)
        if not headers:
            print(f"错误: 无法读取表头 {input_file}")
            return 0
        
        # 处理数据行
        for row_num, row in enumerate(reader, start=3):
            if len(row) < 12:  # 为了确保有足够的列
                skip_count += 1
                continue
            
            try:
                title, district, sub_district, community, area, orientation, layout, floor_info, price, tags, detail_urls, update_time = row
                
                # 数据清洗和标准化
                processed_row = {
                    'title': title.strip() if title else '未知',
                    'district': standardize_district(district),
                    'subDistrict': sub_district.strip() if sub_district else '未知',
                    'community': community.strip() if community else '未知',
                    'area': clean_area(area),
                    'orientation': standardize_orientation(orientation),
                    'layout': clean_layout(layout),
                    'floorInfo': floor_info.strip() if floor_info else '未知',
                    'price': clean_price(price),
                    'tags': parse_tags(tags),
                    'detailUrls': detail_urls.strip() if detail_urls else '',
                    'updateTime': update_time.strip() if update_time else ''
                }
                
                # 数据验证：跳过异常数据
                if processed_row['price'] <= 0 or processed_row['area'] <= 0:
                    skip_count += 1
                    continue
                
                # 价格合理性检查（租金范围 500-50000）
                if processed_row['price'] < 500 or processed_row['price'] > 50000:
                    skip_count += 1
                    continue
                
                # 面积合理性检查（10-500平米）
                if processed_row['area'] < 10 or processed_row['area'] > 500:
                    skip_count += 1
                    continue
                
                processed_data.append(processed_row)
                
            except Exception as e:
                print(f"处理第{row_num}行时出错: {e}")
                skip_count += 1
                continue
    
    # 写入处理后的数据
    if processed_data:
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        with open(output_file, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.writer(f)
            
            # 写入元数据
            now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            writer.writerow([f"处理后数量: {len(processed_data)}, 跳过异常: {skip_count}, 处理时间: {now}"])
            
            # 写入表头
            writer.writerow(["标题", "区域", "地块", "小区", "面积", "朝向", "户型", "楼层信息", "价格", "标签", "详情页链接", "维护时间"])
            
            # 写入数据
            for item in processed_data:
                writer.writerow([
                    item['title'],
                    item['district'], 
                    item['subDistrict'],
                    item['community'],
                    item['area'],
                    item['orientation'],
                    item['layout'],
                    item['floorInfo'],
                    item['price'],
                    '|'.join(item['tags']),
                    item['detailUrls'],
                    item['updateTime']
                ])
        
        print(f"处理完成: {len(processed_data)} 条数据，跳过 {skip_count} 条异常数据")
        return len(processed_data)
    
    else:
        print(f"没有有效数据")
        return 0

def main():
    # 主函数
    print("开始数据预处理...")
    
    # 路径设置
    data_dir = Path(__file__).parent.parent / "data"
    output_dir = Path(__file__).parent.parent / "ui" / "data"
    
    print(f"输入目录: {data_dir}")
    print(f"输出目录: {output_dir}")
    
    if not data_dir.exists():
        print(f"数据目录不存在: {data_dir}")
        return
    
    # 处理所有CSV文件
    csv_files = list(data_dir.glob("houses_*.csv"))
    
    if not csv_files:
        print("没有找到需要处理的CSV文件")
        return
    
    total_processed = 0
    
    for csv_file in csv_files:
        output_file = output_dir / csv_file.name
        count = preprocess_house_data(csv_file, output_file)
        total_processed += count
        print()
    
    print(f"数据预处理完成！共处理 {total_processed} 条房源数据")
    print(f"输出目录: {output_dir}")

if __name__ == "__main__":
    main() 