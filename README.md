__Idea Comes From One Million Website__
Link: http://www.milliondollarhomepage.com/

#### Languages/Frameworks used
- React.js
- Flask
- PostgreSQL

#### Functionality
- Users can register, log in, and log out.
- Logged-in users can buy/sell pixels on the webpage.
- User-owned pixels listed in the marketplace can be bought.
- Any unowned pixels can be bought by clicking on the home page.
- User transactions will be verified through Bitcoin transactiond.
- Logged-in users can set/edit the color and the brief description of their own areas on the management page.
- Users can sell and recall their pixels through the management page. 
- Anyone can check the details of a square and its surrounding squares pattern by clicking.
- Database contains Users and Pixels with the necessary columns and column types to maintain the above functionality.
- Pixel data are encoded and decoded to reduce bandwidth.
	- rgb => binary(24bits: 8 bits * 3) => base64(4 unicode char)


__Basic Concept and Process Related to Cryptocurrency & Blockchain__

#### Set up:
- MHP: self-create cryptocurrency
	- total tokens: 1000,000
	- token address: 0x6E682420f84f06E2a4B69e162718225E3eE2aAEA
	- test account 1 (mavis) address: 0x3CC637174D6362318fD24a6ae2F15462A58d4183
	- test account 2 (dandy) address: 0xA18E8f4d792Cde9B14E32593D1077Bc3237c6CE6
- On Görli Testnet & Binance Smart Chain(BSC)
	- Using faucet on Görli Testnet (for test)
	- Real money
- Using Metamask wallet (multi-accounts)
- Import chain network & token

#### Process:
- Customer request purchase

- App provide seller address & move item from sell listing to pending transaction book(PTB)

- Customer sends certain MHP to seller address

- Customer upload transaction receipt hash(unique) inside 15 mins

- Exceeding time will result in purchasing failed

- Backend check transaction on chain blocks from fullnode(lightnode, archivenode)

#### Other Settings:
- utility.py: 
	- is_dev = True: activate log; False: deactivate
- consts.py: important value
- PTB is stored in cache because the state only last at most 15mins(time limit can be modified). PTB will be refreshed if server is down (we assume the server will keep running). If a user terminates the purchase process before time runs out, the related transaction in PTB will be force cleared.
