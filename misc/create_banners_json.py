import json
import os
from os import listdir

# fuck python

# @Banner_Support_Sizes
supported_sizes = ["_512x128", "_128x512", "_128x64"]



def create_banners_json():

	to_json_data = {}
	for size in supported_sizes:
		to_json_data.setdefault(size,[])

	file = open('sites.txt', 'r') 
	lines = file.readlines()

	for line in lines:
		site_folder = line.strip()

		for root, dirs, files in os.walk("../"+site_folder):

			data = {}
			for size in supported_sizes:
				data.setdefault(size,[])

			for f in files:
				if not f.startswith("banner_"): continue
				if "." not in f: continue
				name_without_extension = f[0:f.rfind(".")]

				for size in supported_sizes:
					if name_without_extension.endswith(size):
						data[size].append(f)
						break

			for size in supported_sizes:
				if len(data[size]):
					to_json_data[size].append({
						"site": site_folder,
						"banners": data[size]
					})

	
	with open('banners.json', 'w', encoding='utf-8') as out:
		out.write(json.dumps(to_json_data, sort_keys=True, indent=4))
		out.close()


def main():
	create_banners_json()

if __name__ == "__main__":
	main()
