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

#### Functionality (60 points)
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
	- token address: 0x6E682420f84f06E2a4B69e162718225E3eE2aAEA
	- test account 1 (mavis) address: 0x3CC637174D6362318fD24a6ae2F15462A58d4183
	- test account 2 (dandy) address: 0xA18E8f4d792Cde9B14E32593D1077Bc3237c6CE6
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

#### Other Settings:
- utility.py: 
	- is_dev = True: activate log; False: deactivate
- consts.py: important value
- test.py: insert large amount of test records
- PTB is stored in cache because the state only last at most 15mins(time limit can be modified). PTB will be refreshed if server down (we assume the server will keep running).
