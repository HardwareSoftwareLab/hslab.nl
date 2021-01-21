import json
import os
from os import listdir
import os.path

# fuck python


def create_banners_json(ignore_folders=[]):

	supported_sizes = [line.strip('\n') for line in open("supported_banner_sizes.txt").readlines()]
	
	to_json_data = {}
	for size in supported_sizes:
		to_json_data.setdefault(size,[])

	dirs = next(os.walk("../"))[1];

	for folder in dirs:

		if folder in ignore_folders:
			continue

		for _, _, files in os.walk("../"+folder):

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
						"site": folder,
						"banners": data[size]
					})

	
	with open('banners.json', 'w', encoding='utf-8') as out:
		out.write(json.dumps(to_json_data, sort_keys=True, indent=4))
		out.close()


def create_hover_descriptions(ignore_folders=[]):
	to_json_data = {}
	
	dirs = next(os.walk("../"))[1];

	for folder in dirs:

		if folder in ignore_folders:
			continue

		if not os.path.exists(f"../{folder}/hover_description.txt"):
			continue

		f = open(f"../{folder}/hover_description.txt", "r")
		to_json_data.setdefault(folder, f.read())
	
	with open('hover_descriptions.json', 'w', encoding='utf-8') as out:
		out.write(json.dumps(to_json_data, sort_keys=True, indent=4))
		out.close()



def main():
	print('update...')
	f = open("ignore_folders.txt", "r")
	ignore_folders = [line.strip('\n') for line in f.readlines()]
	print(f'{"-"*20}\nignoring folders:\n')
	for folder in ignore_folders: print(folder)
	print(f'{"-"*20}')
	print('create_banners_json...')
	create_banners_json(ignore_folders)
	print('create_hover_descriptions...')
	create_hover_descriptions(ignore_folders)
	print('done')


if __name__ == "__main__":
	main()