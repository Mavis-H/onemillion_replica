# insert into pixel (position, rgb, "user", description)
# values 
# (3500, 'AAAA', 'mavis', ''), 
# (3501, 'AAAA', 'mavis', '')
# ;

def create_entry(i, username, black=True):

	return f"({i}, '{'AAAA' if (black) else '////'}', '{username}', 'andy block')"


def entry_for_user(name):
	entries = []
	for i in range(43080, 43100):
		for j in range(20):
			entries.append(create_entry(i+j*1000, name, True))
	return """insert into pixel (position, rgb, "user", description) values """  +',\n'.join(entries) + ';'


print(entry_for_user('dandy'))
