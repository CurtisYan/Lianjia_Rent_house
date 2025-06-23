import requests
import parsel
import csv
from concurrent.futures import ThreadPoolExecutor, as_completed
import datetime
import time
import os
import sys
import json

# 强制刷新stdout，确保实时输出
def print_flush(msg):
    print(msg, flush=True)
    sys.stdout.flush()

# 地区名称与拼音映射
AREA_MAP = {
    "不限": "",
    "天河": "guangzhou_tianhe",
    "越秀": "guangzhou_yuexiu",
    "荔湾": "guangzhou_liwan",
    "海珠": "guangzhou_haizhu",
    "番禺": "guangzhou_panyu",
    "白云": "guangzhou_baiyun",
    "黄埔": "guangzhou_huangpu",
    "从化": "guangzhou_conghua",
    "增城": "guangzhou_zengcheng",
    "花都": "guangzhou_huadu",
    "南沙": "guangzhou_nansha"
}

def build_url(area_name):
    base = "https://gz.lianjia.com/zufang/"
    area_pinyin = AREA_MAP.get(area_name, "")
    if area_pinyin and area_pinyin != "":
        # 提取区域部分（去掉guangzhou_前缀）
        area_code = area_pinyin.replace("guangzhou_", "")
        return f"{base}{area_code}/"
    else:
        return base  # 不限地区，爬取整个广州

def fetch_page(url, headers, retries=3):
    for _ in range(retries):
        try:
            resp = requests.get(url, headers=headers, timeout=10)
            if resp.status_code == 200:
                return resp.text
        except Exception as e:
            print(f"请求失败: {url} {e}")
            time.sleep(2)
    return None

def crawl(area_name, max_count=3000):
    area_pinyin = AREA_MAP.get(area_name)
    if area_pinyin is None:
        print_flush(f"地区名称错误，请选择以下地区之一：{list(AREA_MAP.keys())}")
        return

    area_url = build_url(area_name)

    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0',
        'Cookie': 'lianjia_uuid=33c13f76-56cf-467d-bc20-82db67d7d768; crosSdkDT2019DeviceId=z6ts93-10vun2-64hg0nri3lnb30r-ax28x5gr2; login_ucid=2000000489359018; lianjia_token=2.00156bc82f40c5a36904c6e11e7bf51d4f; lianjia_token_secure=2.00156bc82f40c5a36904c6e11e7bf51d4f; security_ticket=b7qhpaMqIpFMLr8q5azsuANriKCibEr29SITsrPjUWOhmpj/gipHsUwSl0DuB9IkeFnxmUBEruL6htShUOE+q6Qb2+LuUIiI6id9cZyaUKeWYD67Py5GVnu2bWZjSYPUTbG5u+P/ounZW7sZ+P9/jOUW7+6GcCBxyzIVMtkAsp8=; ftkrc_=16c1d73e-8242-4d4e-b154-29301d8ed592; lfrc_=ca454de6-6be2-48b7-bd19-378573b8b9ea; beikeBaseData=%7B%22parentSceneId%22:%22996219203883979777%22%7D; select_city=440100; GUARANTEE_POPUP_SHOW=true; GUARANTEE_BANNER_SHOW=true; lianjia_ssid=6d645e81-6d32-4930-aa6f-a17f4452998a; hip=TsJsDl4VJ2J4sN7RN-nBOMN4W8ox9yKhrsZ-ELE0dwsqSAEJ88jl3U3ZWeRFepFtOgx6y1WzwxQXfhcudllIge9FmQsdqqypYKxCl7qIGdkrTSkPR3dpmJPxgLqWR3snpLg_w10q0Mah4tJYpi9uFwstNYsrACNj_IIqEGGg3z3M4tMacZLjkvjg4w%3D%3D'
        }

    print_flush(f"开始爬取 {area_name} 地区，目标URL: {area_url}")
    # 爬取第 2-200页
    urls = [area_url] + [f"{area_url}pg{page}/" for page in range(2, 201)]
    results = []
    
    print_flush(f"准备爬取 {len(urls)} 个页面...")
    
    # 并发爬取，3个线程
    with ThreadPoolExecutor(max_workers=3) as executor:
        future_to_url = {executor.submit(fetch_page, url, headers): url for url in urls}
        completed_count = 0
        total_urls = len(urls)
        
        print_flush("开始并发爬取...")
        
        for i, future in enumerate(as_completed(future_to_url)):
            # 完成任务数
            completed_count += 1
            # 百分比
            progress = int((completed_count / total_urls) * 100)
            # 可视化进度条
            progress_bar = '█' * (progress // 2) + '░' * (50 - progress // 2)
            
            # 实时输出进度，使用\r覆盖同一行
            print_flush(f"\r爬取进度: {progress:3d}%|{progress_bar}| {completed_count}/{total_urls} 已获取{len(results)}条数据")
            
            html = future.result()
            if not html:
                continue

            # 创建HTML解析器    
            selector = parsel.Selector(html)
            lis = selector.css('.content__list--item--main')
            if not lis:
                continue
                
            page_results = 0
            for li in lis:
                # 提取标题
                title = li.css('.content__list--item--title a::text').get(default='null').strip()
                # 地块和信息
                house_info_list = li.css('p.content__list--item--des ::text').getall()
                # 去除空白、换行、'-'和'/'符号
                house_info = [item.strip() for item in house_info_list if item.strip() and item.strip() not in ('-', '/')]
                # 去除最后一项多余空格
                if house_info:
                    house_info[-1] = ' '.join(house_info[-1].split())
                # 如果字段不够，补上统一的缺失字符
                MISSING = 'null'
                if len(house_info) < 7:
                    house_info += [MISSING] * (7 - len(house_info))
                # 解包变量
                district, sub_district, community, area, orientation, layout, floor_info = house_info[:7]
                # 价格
                price = li.css('.content__list--item-price em::text').get(default=MISSING).strip()
                # 标签
                tags = li.css('.content__list--item--bottom.oneline i::text').getall()
                tags = [tag.strip() for tag in tags if tag.strip()]
                # 详情页链接
                detail_paths = li.css('.content__list--item--title a::attr(href)').getall()
                detail_urls = ["https://gz.lianjia.com" + path for path in detail_paths]
                # 维护信息
                update_time = li.css('span.content__list--item--time.oneline::text').get(default=MISSING).strip()
                results.append([
                    title, district, sub_district, community, area, orientation, layout, floor_info, price,
                    '|'.join(tags), '|'.join(detail_urls), update_time
                ])
                page_results += 1
                if len(results) >= max_count:
                    break
                    
            if len(results) >= max_count:
                print_flush(f"\n已达到最大爬取数量 {max_count}，停止爬取")
                break
                
        # 完成后换行
        print_flush("")
    
    print_flush(f"本次共爬取{len(results)}条数据")
    
    # 如果爬取数据为0，不更新文件
    if len(results) == 0:
        print_flush(f"警告：爬取到0条数据，不更新现有文件，保留原有数据")
        return
    
    print_flush("正在保存原始数据文件...")
    
    # 只写入csv到本地 data 目录（原始数据）
    data_dir_root = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    os.makedirs(data_dir_root, exist_ok=True)
    csv_name = f"houses_{area_pinyin or 'guangzhou_all'}.csv"
    csv_path_root = os.path.join(data_dir_root, csv_name)
    with open(csv_path_root, "w", newline='', encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        writer.writerow([f"爬取数量: {len(results)}, 更新时间: {now}"])
        writer.writerow(["标题", "区域", "地块", "小区", "面积", "朝向", "户型", "楼层信息", "价格", "标签", "详情页链接", "维护时间"])
        writer.writerows(results)
    print_flush(f"已写入原始数据文件: {csv_path_root}")
    
    print_flush("提示：运行 'python preprocess_data.py' 来处理数据并同步到前端")
    print(f"本次共爬取{len(results)}条数据")

if __name__ == "__main__":
    print_flush("广州链家租房数据爬虫")
    print_flush("可选地区：不限、天河、越秀、荔湾、海珠、番禺、白云、黄埔、从化、增城、花都、南沙")
    
    # 支持命令行参数
    if len(sys.argv) > 1:
        area_name = sys.argv[1].strip()
    else:
        # 如果没有命令行参数（前端没返回），从普通输入读取
        try:
            area_name = input("请输入要爬取的地区名称：").strip()
        except EOFError:
            print_flush("错误：需要提供地区名称")
            print_flush("使用方法：python guangzhou_main.py <地区名称>")
            sys.exit(1)
    
    print_flush(f"开始爬取 {area_name} 地区的房源数据...")
    start_time = time.time()
    # 最大爬取数量
    crawl(area_name, max_count=3000)
    end_time = time.time()
    print_flush(f"⏱️  总耗时: {end_time - start_time:.2f} 秒")
