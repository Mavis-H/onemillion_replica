# insert into pixel (position, rgb, "user", description)
# values 
# (3500, 'AAAA', 'mavis', ''), 
# (3501, 'AAAA', 'mavis', '')
# ;

def create_entry(i, username, black=True):

	return f"({i}, '{'AAAA' if (black) else '////'}', '{username}', 'example descrip')"


def entry_for_user(name):
	entries = []
	for x in range(0, 100):
		print(x)
		for y in range(0, 100):
			if (x**2 + 2*(y % 3) >0 ):
				entries.append(create_entry(x+y*100, username, ))
	return ',\n'.join(entries)

print(entry_for_user('mavis'))
