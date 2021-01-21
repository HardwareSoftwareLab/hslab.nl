import json
import os
from os import listdir

# fuck python

def create_hover_descriptions():
	to_json_data = {}
	
	file = open('sites.txt', 'r') 
	lines = file.readlines()

	for line in lines:
		site_folder = line.strip()

		f = open(f"../{site_folder}/hover_description.txt", "r")
		to_json_data.setdefault(site_folder, f.read())
	
	with open('hover_descriptions.json', 'w', encoding='utf-8') as out:
		out.write(json.dumps(to_json_data, sort_keys=True, indent=4))
		out.close()


def main():
	create_hover_descriptions()
	

if __name__ == "__main__":
	main()
