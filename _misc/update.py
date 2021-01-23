import json
import os
from os import listdir
import os.path
from pprint import pprint

# fuck python


def create_dict_banner_sources(folder, supported_sizes) -> ():

	banner_sources = {}

	for _, _, files in os.walk(folder):

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
					data[size].append(f)
					if size in unfound_sizes: 
						unfound_sizes.remove(size)
					break
		
		for size in supported_sizes:
			if len(data[size]):
				banner_sources[size] = data[size];
				
	return (banner_sources, unfound_sizes)



def main():

	json_file = {
		"sites": {}
	}

	errors = []

	with open('update_info.json') as f:
		update_info = json.load(f)

		json_file = {**json_file, **update_info}

		dirs = next(os.walk("../"))[1];

		for folder in dirs:
			if folder in update_info["ignore_folders"]:
				continue
			if not os.path.exists(f"../{folder}/site_info.json"):
				continue

			#
			# banner sources
			#
			banner_sources, unfound_sizes = create_dict_banner_sources(f"../{folder}", update_info["supported_banner_sizes"])

			ok = True

			if len(unfound_sizes):
				error_prefix = "[ERROR]" if update_info["one_banner_of_each_size_required"] else "[WARNING]"
				errors.append(f"{error_prefix} '{folder}' has no banners in the following sizes {unfound_sizes}")
				if update_info["one_banner_of_each_size_required"]:
					ok = False

			if not ok: continue
			
			#
			# data from site_info.json
			#
			with open(f"../{folder}/site_info.json") as f2:
				site_info = {**json.load(f2), **{"folder": folder}}

			site_data = {
				**site_info,
				**{"banner_sources": banner_sources}
			}

			json_file["sites"] = {**json_file["sites"], **{folder: site_data}}

		#
		# width_height_lookup
		#
		width_height_lookup = {}

		for size in update_info["supported_banner_sizes"]:
			wh = size[1:].split("x")
			width_height_lookup[size] = [int(wh[0]),int(wh[1])]
		
		json_file["width_height_lookup"] = width_height_lookup
		
		#
		# export to data.json
		#
		with open('data.json', 'w', encoding='utf-8') as out:
			out.write(json.dumps(json_file, sort_keys=True, indent=4))
			out.close()

	for error in errors:
		print(error)

	print("done")


if __name__ == "__main__":
	main()