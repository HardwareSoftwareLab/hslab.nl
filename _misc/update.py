import json
import os
from os import listdir
import os.path

# fuck python


def first_check_if_folder_is_valid_for_site(folder, ignore_folders=[]) -> bool:

	if folder in ignore_folders:
		return False

	# site_info.json is mandatory
	if not os.path.exists(f"../{folder}/site_info.json"):
		return False

	return True




def create_banners_json(ignore_folders=[]):

	supported_sizes = [line.strip('\n') for line in open("supported_banner_sizes.txt").readlines()]
	
	to_json_data = {}
	for size in supported_sizes:
		to_json_data.setdefault(size,[])

	dirs = next(os.walk("../"))[1];

	for folder in dirs:

		if not first_check_if_folder_is_valid_for_site(folder, ignore_folders):
			continue

		for _, _, files in os.walk("../"+folder):

			unfound_sizes = supported_sizes.copy()
		
			data = {}
			for size in supported_sizes:
				data.setdefault(size,[])

			for f in files:
				if not f.startswith("banner_"): continue
				if "." not in f: continue
				name_without_extension = f[0:f.rfind(".")]

				for size in supported_sizes:
					if name_without_extension.endswith(size):
						data[size].append(folder+"/"+f)
						unfound_sizes.remove(size)
						break

			if len(unfound_sizes):
				print(f"{folder} has the following missing banners: {unfound_sizes}")
				# should all bannders be required?
			
			for size in supported_sizes:
				if len(data[size]):
					to_json_data[size].append({
						"site": folder,
						"banners": data[size]
					})

	
	with open('banners.json', 'w', encoding='utf-8') as out:
		out.write(json.dumps(to_json_data, sort_keys=True, indent=4))
		out.close()



def create_info_all_sites_json(ignore_folders=[]):
	to_json_data = {}
	
	dirs = next(os.walk("../"))[1];

	for folder in dirs:

		if not first_check_if_folder_is_valid_for_site(folder, ignore_folders):
			continue

		with open(f"../{folder}/site_info.json") as json_file:
			data = json.load(json_file)
			to_json_data[folder] = data

	with open('info_all_sites.json', 'w', encoding='utf-8') as out:
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
	print('create_info_all_sites_json...')
	create_info_all_sites_json(ignore_folders)
	print('done')


if __name__ == "__main__":
	main()