# CSE330

## Approved by David Buckley
## Siqian Hou
## 502936
## Mavis-H

__Idea Comes From One Million Website__
Link: http://www.milliondollarhomepage.com/

#### Rubric turned in on time (5 points)

#### Languages/Frameworks used (20 points) => (25 points)
- 10: Learned/Used React.js frontend
- 10: Learned/Used Flask backend
- 0: MySQL Database => 5: PostgreSQL Database

#### Functionality (70 points)
- 10: Users can register, login, and logout
- 5: Logged in users can buy/sell a square area on the webpage.
- 15: Users trasaction will be verified through Bitcoin transaction.
- 15: Logged in users can set/edit the color and the brief description of their own areas. 
- 5：Any user can check the description of squares. 
- 10: Database contains Users and Squares with the necessary columns and column types to maintain the above functionality

#### Best Practices (5 points)
- Code is readable and well formatted
- All pages pass the html validator

#### Creative Portion (10 points) => (5 points)
- User can also check detail square and surrounding suqares pattern on click
- Data encoding & decoding, reduce bandwidth
	- only transfer pixels owned by user, others set to default 
	- rgb => binary(24bits: 8 bits * 3) => base64(4 unicode char)


__Basic Concept and Process Related to Cryptocurrency & Blockchain__

#### Set up:
- MHP: self create cryptocurrency
	- total tokens: 1000,000
	- contract address:
	- test account 1 address:
	- test account 2 address:
- On Görli Testnet & Binance Smart Chain(BSC)
	- Using faucet on Görli Testnet (for test)
	- Real money
- Using metamask wallet (multi-accounts)
- Import chain network & token

#### Process:
- Customer request purchase

- App provide seller address & move item from sell listing to pending transaction book(PTB)

- Customer send certain MHP to seller address

- Customer upload transaction receipt hash(unique) inside 15 mins

- Exceeding time will result in purchase failed

- backend check transaction on chain blocks from fullnode(lightnode, archivenode)


