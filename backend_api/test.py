# insert into pixel (position, rgb, "user", description)
# values 
# (3500, 'AAAA', 'mavis', ''), 
# (3501, 'AAAA', 'mavis', '')
# ;

def create_entry1(i, username, black=True):

	return f"({i}, '{'AAAA' if (black) else '////'}', '{username}', 'andy block')"


def entry_for_user1(name):
	entries = []
	for i in range(43080, 43100):
		for j in range(20):
			entries.append(create_entry1(i+j*1000, name, True))
	return """insert into pixel (position, rgb, "user", description) values """  +',\n'.join(entries) + ';'


print(entry_for_user1('dandy'))


def create_entry2(i, username, black=True):

	return f"({i}, '{'AAAA' if (black) else '////'}', '{username}', 'example descrip')"


def entry_for_user2(name):
	entries = []
	for x in range(0, 100):
		print(x)
		for y in range(0, 100):
			if (x**2 + 2*(y % 3) >0 ):
				entries.append(create_entry2(x+y*100, name, ))
	return ',\n'.join(entries)

print(entry_for_user2('mavis'))
