// ------------------------------------
// 1. DEPENDENCIES
// ------------------------------------

require("dotenv").config();
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const fetch = require("node-fetch");
const io = require("socket.io-client");
const socket = io(process.env.PRICES_URL);

// -----------------------------------------
// 2. GLOBAL VARIABLES
// -----------------------------------------

const TRADING_ABI = [{"inputs":[{"internalType":"address","name":"_gov","type":"address"},{"internalType":"address","name":"_dev","type":"address"},{"internalType":"contractNftInterfaceV4[5]","name":"_nft","type":"address[5]"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"address","name":"value","type":"address"}],"name":"AddressUpdated","type":"event"},{"anonymous":false,"inputs":[],"name":"ChainlinkCallbackFailed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"trader","type":"address"},{"indexed":true,"internalType":"uint256","name":"pairIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"userTradesIndex","type":"uint256"},{"indexed":false,"internalType":"bool","name":"tp","type":"bool"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"TpSlUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"trader","type":"address"},{"indexed":false,"internalType":"uint256","name":"pairIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"wantedPrice","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"slippageP","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"openPrice","type":"uint256"}],"name":"TradeCanceledMarket","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"trader","type":"address"},{"indexed":true,"internalType":"uint256","name":"pairIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"userTradesIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"},{"indexed":false,"internalType":"bool","name":"buy","type":"bool"},{"indexed":false,"internalType":"uint256","name":"positionSizeToken","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"leverage","type":"uint256"},{"indexed":false,"internalType":"int256","name":"pnlToken","type":"int256"},{"indexed":false,"internalType":"uint256","name":"tokenPriceUsd","type":"uint256"}],"name":"TradeClosedMarket","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"trader","type":"address"},{"indexed":true,"internalType":"uint256","name":"pairIndex","type":"uint256"}],"name":"TradeLimitCanceled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"trader","type":"address"},{"indexed":true,"internalType":"uint256","name":"pairIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"userTradesIndex","type":"uint256"},{"indexed":true,"internalType":"address","name":"nftHolder","type":"address"},{"indexed":false,"internalType":"uint256","name":"orderType","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"},{"indexed":false,"internalType":"bool","name":"buy","type":"bool"},{"indexed":false,"internalType":"uint256","name":"leverage","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"positionSizeToken","type":"uint256"},{"indexed":false,"internalType":"int256","name":"pnlToken","type":"int256"},{"indexed":false,"internalType":"uint256","name":"rewardToken","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"tokenPriceUsd","type":"uint256"}],"name":"TradeLimitExecuted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"trader","type":"address"},{"indexed":true,"internalType":"uint256","name":"pairIndex","type":"uint256"}],"name":"TradeLimitOpened","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"trader","type":"address"},{"indexed":true,"internalType":"uint256","name":"pairIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"userTradesIndex","type":"uint256"},{"indexed":false,"internalType":"bool","name":"buy","type":"bool"},{"indexed":false,"internalType":"uint256","name":"leverage","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"positionSizeToken","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"positionSizeUsd","type":"uint256"}],"name":"TradeOpenedMarket","type":"event"},{"inputs":[],"name":"devFees","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"devFund","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"govFees","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"govFund","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"lp","outputs":[{"internalType":"contractIUniswapV2Pair","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"nft","outputs":[{"internalType":"contractNftInterfaceV4","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"nftLastSuccess","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"nftRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"openLimitOrders","outputs":[{"internalType":"address","name":"trader","type":"address"},{"internalType":"uint256","name":"pairIndex","type":"uint256"},{"internalType":"uint256","name":"positionSizeToken","type":"uint256"},{"internalType":"uint256","name":"spreadReductionP","type":"uint256"},{"internalType":"bool","name":"buy","type":"bool"},{"internalType":"uint256","name":"leverage","type":"uint256"},{"internalType":"uint256","name":"tp","type":"uint256"},{"internalType":"uint256","name":"sl","type":"uint256"},{"internalType":"uint256","name":"minPrice","type":"uint256"},{"internalType":"uint256","name":"maxPrice","type":"uint256"},{"internalType":"uint256","name":"block","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"pairTraders","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"pairTradersId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"pendingMarketCloseCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"pendingMarketOpenCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"pendingOrderIds","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"pool","outputs":[{"internalType":"contractGFarmPoolInterfaceV4","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"priceAggregator","outputs":[{"internalType":"contractPriceAggregatorInterfaceV4","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"reqID_pendingNftOrder","outputs":[{"internalType":"address","name":"nftHolder","type":"address"},{"internalType":"uint256","name":"nftId","type":"uint256"},{"internalType":"address","name":"trader","type":"address"},{"internalType":"uint256","name":"pairIndex","type":"uint256"},{"internalType":"uint256","name":"userTradesIndex","type":"uint256"},{"internalType":"uint256","name":"orderType","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"token","outputs":[{"internalType":"contractTokenInterfaceV4","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"tokensBurned","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"tokensMinted","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"traders","outputs":[{"internalType":"uint256","name":"leverageUnlocked","type":"uint256"},{"internalType":"address","name":"referral","type":"address"},{"internalType":"uint256","name":"referralRewardsTotal","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"tradesPerBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"userOpenLimitOrderId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"userTrades","outputs":[{"internalType":"address","name":"trader","type":"address"},{"internalType":"uint256","name":"pairIndex","type":"uint256"},{"internalType":"uint256","name":"userTradesIndex","type":"uint256"},{"internalType":"uint256","name":"positionSizeToken","type":"uint256"},{"internalType":"uint256","name":"positionSizeUsd","type":"uint256"},{"internalType":"uint256","name":"openPrice","type":"uint256"},{"internalType":"uint256","name":"spreadReductionP","type":"uint256"},{"internalType":"bool","name":"buy","type":"bool"},{"internalType":"uint256","name":"leverage","type":"uint256"},{"internalType":"uint256","name":"tp","type":"uint256"},{"internalType":"uint256","name":"sl","type":"uint256"},{"internalType":"uint256","name":"tpLastUpdated","type":"uint256"},{"internalType":"uint256","name":"slLastUpdated","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"userTradesCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"_token","type":"uint256"},{"internalType":"uint256","name":"_usd","type":"uint256"}],"name":"setReservesLp","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_gov","type":"address"}],"name":"setGovFund","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_token","type":"address"}],"name":"setToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_lp","type":"address"}],"name":"setLp","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_pool","type":"address"}],"name":"setPool","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_aggregator","type":"address"}],"name":"setPriceAggregator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"tokenPriceUsd","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"_trader","type":"address"},{"internalType":"uint256","name":"_pairIndex","type":"uint256"}],"name":"hasOpenLimitOrder","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"bool","name":"_buy","type":"bool"},{"internalType":"uint256","name":"_positionSizeToken","type":"uint256"},{"internalType":"uint256","name":"_leverage","type":"uint256"},{"internalType":"uint256","name":"_spreadReductionId","type":"uint256"},{"internalType":"uint256","name":"_price","type":"uint256"},{"internalType":"uint256","name":"_slippageP","type":"uint256"},{"internalType":"uint256","name":"_tpP","type":"uint256"},{"internalType":"uint256","name":"_slP","type":"uint256"},{"internalType":"bool","name":"_limit","type":"bool"},{"internalType":"address","name":"_referral","type":"address"}],"name":"openTrade","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_order","type":"uint256"},{"internalType":"uint256","name":"_price","type":"uint256"},{"internalType":"uint256","name":"_spreadP","type":"uint256"}],"name":"openTradeMarketCallback","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"}],"name":"cancelOpenLimitOrder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_userTradesIndex","type":"uint256"},{"internalType":"uint256","name":"_newSl","type":"uint256"}],"name":"updateSl","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_userTradesIndex","type":"uint256"},{"internalType":"uint256","name":"_newTp","type":"uint256"}],"name":"updateTp","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_userTradesIndex","type":"uint256"}],"name":"closeTradeMarket","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_order","type":"uint256"},{"internalType":"uint256","name":"_price","type":"uint256"}],"name":"closeTradeMarketCallback","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_orderType","type":"uint256"},{"internalType":"address","name":"_a","type":"address"},{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_userTradesIndex","type":"uint256"},{"internalType":"uint256","name":"_nftId","type":"uint256"},{"internalType":"uint256","name":"_nftType","type":"uint256"}],"name":"executeNftOrder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_order","type":"uint256"},{"internalType":"uint256","name":"_price","type":"uint256"},{"internalType":"uint256","name":"_spreadP","type":"uint256"}],"name":"executeNftOpenOrderCallback","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_order","type":"uint256"},{"internalType":"uint256","name":"_price","type":"uint256"}],"name":"executeNftCloseOrderCallback","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_order","type":"uint256"}],"name":"marketOrderCallbackFailed","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimFees","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"}],"name":"pairTradersArray","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"openLimitOrdersCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"pendingOrderIdsCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"order","type":"uint256"}],"name":"reqID_pendingMarketOrder_get","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"bool","name":"","type":"bool"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true}];
const AGGREGATOR_ABI = [{"inputs":[{"internalType":"address","name":"_gov","type":"address"},{"internalType":"contractTradingInterfaceV4","name":"_trading","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"address","name":"a","type":"address"}],"name":"AddressUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"id","type":"bytes32"}],"name":"ChainlinkCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"id","type":"bytes32"}],"name":"ChainlinkFulfilled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"id","type":"bytes32"}],"name":"ChainlinkRequested","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"index","type":"uint256"},{"indexed":false,"internalType":"address","name":"a","type":"address"},{"indexed":false,"internalType":"uint256","name":"fee","type":"uint256"}],"name":"NodeAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"index","type":"uint256"},{"indexed":false,"internalType":"address","name":"a","type":"address"},{"indexed":false,"internalType":"uint256","name":"fee","type":"uint256"}],"name":"NodeRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"decimals","type":"uint256"}],"name":"NumberUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"from","type":"string"},{"indexed":false,"internalType":"string","name":"to","type":"string"}],"name":"PairAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"from","type":"string"},{"indexed":false,"internalType":"string","name":"to","type":"string"}],"name":"PairRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bool","name":"paused","type":"bool"}],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes32","name":"request","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"order","type":"uint256"},{"indexed":false,"internalType":"address","name":"node","type":"address"},{"indexed":false,"internalType":"uint256","name":"pairIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"referencePrice","type":"uint256"}],"name":"PriceReceived","type":"event"},{"inputs":[],"name":"currentOrder","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"devOpenFeeP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"gov","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"govOpenFeeP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"isPaused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"lpCloseFeeP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"lpLiqFeeP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"maxDeviationFromFeed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"maxGainP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"maxPosTokenIncreaseP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"maxPosTokenP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"maxTradesPerBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"minAnswers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"minLimitOrderSlippageP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"minPosUsd","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"nftLimitOrderFeeP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"nftLinkFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"nftLiqFeeP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"nftSuccessTimelock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"nodes","outputs":[{"internalType":"address","name":"a","type":"address"},{"internalType":"uint256","name":"fee","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"orderAnswers","outputs":[{"internalType":"int256","name":"","type":"int256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"pairs","outputs":[{"internalType":"string","name":"from","type":"string"},{"internalType":"string","name":"to","type":"string"},{"internalType":"uint256","name":"spreadP","type":"uint256"},{"internalType":"uint256","name":"openInterestToken","type":"uint256"},{"internalType":"uint256","name":"maxOpenInterestToken","type":"uint256"},{"internalType":"contractAggregatorV3Interface","name":"feed","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"pairsCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"referralP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"requests","outputs":[{"internalType":"uint256","name":"orderId","type":"uint256"},{"internalType":"uint256","name":"orderType","type":"uint256"},{"internalType":"uint256","name":"pairIndex","type":"uint256"},{"internalType":"bool","name":"initiated","type":"bool"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"spreadReductionsP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"trading","outputs":[{"internalType":"contractTradingInterfaceV4","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"_gov","type":"address"}],"name":"setGov","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_trading","type":"address"}],"name":"setTrading","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_minAnswers","type":"uint256"}],"name":"setMinAnswers","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_max","type":"uint256"}],"name":"setMaxDeviationFromFeed","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_index","type":"uint256"},{"internalType":"address","name":"_a","type":"address"},{"internalType":"uint256","name":"_fee","type":"uint256"}],"name":"replaceNode","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_a","type":"address"},{"internalType":"uint256","name":"_fee","type":"uint256"}],"name":"addNode","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_from","type":"string"},{"internalType":"string","name":"_to","type":"string"},{"internalType":"bytes32[20]","name":"_jobs","type":"bytes32[20]"},{"internalType":"uint256","name":"_spreadP","type":"uint256"},{"internalType":"uint256","name":"_maxOpenInterestToken","type":"uint256"},{"internalType":"contractAggregatorV3Interface","name":"_feed","type":"address"}],"name":"addPair","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"}],"name":"pairJobs","outputs":[{"internalType":"bytes32[20]","name":"","type":"bytes32[20]"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_spreadP","type":"uint256"}],"name":"updateSpread","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_jobIndex","type":"uint256"},{"internalType":"bytes32","name":"_newJob","type":"bytes32"}],"name":"updateJob","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_newMaxOpenInterest","type":"uint256"}],"name":"updateMaxOpenInterest","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"contractAggregatorV3Interface","name":"_newFeed","type":"address"}],"name":"updateFeed","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"paused","type":"bool"}],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_minPos","type":"uint256"}],"name":"setMinPosUsd","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_maxPosLp","type":"uint256"}],"name":"setMaxPosTokenP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_maxIncrease","type":"uint256"}],"name":"setMaxPosTokenIncreaseP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_blocks","type":"uint256"}],"name":"setNftSuccessTimelock","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_govFee","type":"uint256"},{"internalType":"uint256","name":"_devFee","type":"uint256"},{"internalType":"uint256","name":"_lpFee","type":"uint256"}],"name":"setFees","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_nftLiqFee","type":"uint256"},{"internalType":"uint256","name":"_lpLiqFee","type":"uint256"}],"name":"setLiqFees","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_nftLimitOrderFeeP","type":"uint256"}],"name":"setNftLimitOrderFeeP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_max","type":"uint256"}],"name":"setMaxTradesPerBlock","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_max","type":"uint256"}],"name":"setMaxGainP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_1","type":"uint256"},{"internalType":"uint256","name":"_2","type":"uint256"},{"internalType":"uint256","name":"_3","type":"uint256"},{"internalType":"uint256","name":"_4","type":"uint256"},{"internalType":"uint256","name":"_5","type":"uint256"}],"name":"setSpreadReductionsP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_min","type":"uint256"}],"name":"setMinLimitOrderSlippageP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_fee","type":"uint256"}],"name":"setNftLinkFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_orderType","type":"uint256"}],"name":"getPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_requestId","type":"bytes32"},{"internalType":"uint256","name":"_price","type":"uint256"}],"name":"fulfill","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_positionSizeToken","type":"uint256"},{"internalType":"uint256","name":"_leverage","type":"uint256"}],"name":"canOpenTrade","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_positionSizeToken","type":"uint256"},{"internalType":"uint256","name":"_leverage","type":"uint256"}],"name":"increaseOpenInterest","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pairIndex","type":"uint256"},{"internalType":"uint256","name":"_positionSizeToken","type":"uint256"},{"internalType":"uint256","name":"_leverage","type":"uint256"}],"name":"decreaseOpenInterest","outputs":[],"stateMutability":"nonpayable","type":"function"}];
const NFT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"baseURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"}];
const LINK_ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"transferAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_subtractedValue","type":"uint256"}],"name":"decreaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_addedValue","type":"uint256"}],"name":"increaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"data","type":"bytes"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"}];

let allowedLink = false, selectedProvider = null, eventSubscription = null,
	providers = [], web3 = [], openTrades = [], pairs = [], nfts = [], nftsBeingUsed = [], ordersTriggered = [],
	nftTimelock, tradingContract, aggregatorContract, nftContract1, nftContract2, nftContract3, nftContract4, nftContract5, linkContract;

// --------------------------------------------
// 3. INIT: CHECK ENV VARS & LINK ALLOWANCE
// --------------------------------------------

console.log("Welcome to the Gains.farm NFT bot!");
if(!process.env.WSS_URLS || !process.env.PRICES_URL || !process.env.TRADING_ADDRESS
|| !process.env.AGGREGATOR_ADDRESS || !process.env.NFT1_ADDRESS || !process.env.NFT2_ADDRESS
|| !process.env.NFT3_ADDRESS || !process.env.NFT4_ADDRESS || !process.env.NFT5_ADDRESS
|| !process.env.LINK_ADDRESS || !process.env.PRIVATE_KEY || !process.env.PUBLIC_KEY
|| !process.env.EVENT_CONFIRMATIONS_SEC || !process.env.TRIGGER_TIMEOUT){
	console.log("Please fill all parameters in the .env file.");
	process.exit();
}

async function checkLinkAllowance(){
	web3[selectedProvider].eth.net.isListening().then(async () => {
		const allowance = await linkContract.methods.allowance(process.env.PUBLIC_KEY, process.env.TRADING_ADDRESS).call();
		if(parseFloat(allowance) > 0){
			allowedLink = true;
			console.log("LINK allowance OK.");
		}else{
			console.log("LINK not allowed, approving now.");
			
			await linkContract.methods.approve(process.env.TRADING_ADDRESS, "115792089237316195423570985008687907853269984665640564039457584007913129639935")
			.send({from: process.env.PUBLIC_KEY}).then(() => {
				console.log("LINK successfully approved.");
				allowedLink = true;
			}).catch((e) => {
				console.log("LINK approve tx fail (" + e + ")");
				setTimeout(() => { checkLinkAllowance(); }, 2*1000);
			});
		}
	}).catch(() => {
		setTimeout(() => { checkLinkAllowance(); }, 5*1000);
	});
}

// -----------------------------------------
// 4. WEB3 PROVIDER
// -----------------------------------------

const WSS_URLS = process.env.WSS_URLS.split(",");

function selectProvider(n){
	if(eventSubscription !== null && eventSubscription.id !== null){
		eventSubscription.unsubscribe();		
	}

	eventSubscription = null;
	selectedProvider = n;
	tradingContract = new web3[n].eth.Contract(TRADING_ABI, process.env.TRADING_ADDRESS);
	aggregatorContract = new web3[n].eth.Contract(AGGREGATOR_ABI, process.env.AGGREGATOR_ADDRESS);
	nftContract1 = new web3[n].eth.Contract(NFT_ABI, process.env.NFT1_ADDRESS);
	nftContract2 = new web3[n].eth.Contract(NFT_ABI, process.env.NFT2_ADDRESS);
	nftContract3 = new web3[n].eth.Contract(NFT_ABI, process.env.NFT3_ADDRESS);
	nftContract4 = new web3[n].eth.Contract(NFT_ABI, process.env.NFT4_ADDRESS);
	nftContract5 = new web3[n].eth.Contract(NFT_ABI, process.env.NFT5_ADDRESS);
	linkContract = new web3[n].eth.Contract(LINK_ABI, process.env.LINK_ADDRESS);
	fetchTradingVariables();
	fetchOpenTrades();
	watchLiveTradingEvents();
}

const getProvider = (wssId) => {
	const provider = new Web3.providers.WebsocketProvider(WSS_URLS[wssId], {clientConfig:{keepalive:true,keepaliveInterval:30*1000}});

	provider.on('close', () => {
		web3[wssId]._provider.engine.stop();
		setTimeout(() => {
			if(!provider.connected){
				console.log(WSS_URLS[wssId]+' closed: trying to reconnect...');

				let connectedProvider = -1;
				for(var i = 0; i < WSS_URLS.length; i++){
					if(providers[i].connected){
						connectedProvider = i;
						break;
					}
				}
				if(connectedProvider > -1 && selectedProvider === wssId){
					selectProvider(connectedProvider);
					console.log("Switched to WSS " + WSS_URLS[selectedProvider]);
				}else if(connectedProvider === -1 && selectedProvider === wssId){
					console.log("No WSS to switch to...");
				}

				providers[wssId] = getProvider(wssId);
				HDWalletProvider.prototype.on = provider.on.bind(providers[wssId]);
				web3[wssId] = new Web3(new HDWalletProvider(process.env.PRIVATE_KEY, providers[wssId]));
			}
		}, 5*1000);
	});

	provider.on('connect', () => {
		setTimeout(() => {
			if(provider.connected){
				console.log('Connected to WSS '+WSS_URLS[wssId]+'.');

				let connectedProvider = -1;
				for(var i = 0; i < WSS_URLS.length; i++){
					if(providers[i].connected && i !== wssId){
						connectedProvider = i;
						break;
					}
				}
				if(connectedProvider === -1 || selectedProvider === null){
					selectProvider(wssId);
					console.log("Switched to WSS " + WSS_URLS[selectedProvider]);
					checkLinkAllowance();
				}else{
					console.log("No need to switch WSS, already connected to " + WSS_URLS[selectedProvider]);
				}
			}
		}, 5*1000);
	});
	provider.on('error', () => console.log("WSS "+WSS_URLS[wssId]+" error"));
	return provider;
};

for(var i = 0; i < WSS_URLS.length; i++){
	const provider = getProvider(i);
	providers.push(provider);
	HDWalletProvider.prototype.on = provider.on.bind(provider);
	web3.push(new Web3(new HDWalletProvider(process.env.PRIVATE_KEY, provider)));
}

setInterval(async () => {
	let promises = [];
	for(var i = 0; i < WSS_URLS.length; i++){
		(function(index) {
			web3[index].eth.net.isListening().then(async () => {
				promises.push(web3[index].eth.getBlockNumber());
			}).catch(() => {
				promises.push(null);
			});
		})(i);
	}

	Promise.all(promises).then((b) => {
		for(var i = 0; i < WSS_URLS.length; i++){
			if(b[i] > b[selectedProvider]){
				console.log("Switched to WSS " + WSS_URLS[i] + " (block #" + b[i] + " vs #" + b[selectedProvider]);
				selectProvider(i);
				break;
			}
		}
	});
}, 20*1000);

setInterval(() => {
	console.log("Current WSS: " + WSS_URLS[selectedProvider]);
}, 120*1000);

// -----------------------------------------
// 5. FETCH PAIRS, NFTS, AND NFT TIMELOCK
// -----------------------------------------

async function fetchTradingVariables(){
	web3[selectedProvider].eth.net.isListening().then(async () => {
		const nftSuccessTimelock = await aggregatorContract.methods.nftSuccessTimelock().call();
		const pairsCount = await aggregatorContract.methods.pairsCount().call();
		nfts = [];

		const nftsCount1 = await nftContract1.methods.balanceOf(process.env.PUBLIC_KEY).call();
		const nftsCount2 = await nftContract2.methods.balanceOf(process.env.PUBLIC_KEY).call();
		const nftsCount3 = await nftContract3.methods.balanceOf(process.env.PUBLIC_KEY).call();
		const nftsCount4 = await nftContract4.methods.balanceOf(process.env.PUBLIC_KEY).call();
		const nftsCount5 = await nftContract5.methods.balanceOf(process.env.PUBLIC_KEY).call();

		for(var i = 0; i < nftsCount1; i++){
			const id = await nftContract1.methods.tokenOfOwnerByIndex(process.env.PUBLIC_KEY, i).call();
			nfts.push({id: id, type: 1});
		}
		for(var i = 0; i < nftsCount2; i++){
			const id = await nftContract2.methods.tokenOfOwnerByIndex(process.env.PUBLIC_KEY, i).call();
			nfts.push({id: id, type: 2});
		}
		for(var i = 0; i < nftsCount3; i++){
			const id = await nftContract3.methods.tokenOfOwnerByIndex(process.env.PUBLIC_KEY, i).call();
			nfts.push({id: id, type: 3});
		}
		for(var i = 0; i < nftsCount4; i++){
			const id = await nftContract4.methods.tokenOfOwnerByIndex(process.env.PUBLIC_KEY, i).call();
			nfts.push({id: id, type: 4});
		}
		for(var i = 0; i < nftsCount5; i++){
			const id = await nftContract5.methods.tokenOfOwnerByIndex(process.env.PUBLIC_KEY, i).call();
			nfts.push({id: id, type: 5});
		}

		let pairsPromises = [];
		for(var i = 0; i < pairsCount; i++){
			pairsPromises.push(aggregatorContract.methods.pairs(i).call());
		}

		Promise.all(pairsPromises).then((s) => {
			pairs = [];
			for(var j = 0; j < s.length; j++){
				pairs.push(s[j]);
			}
			nftTimelock = nftSuccessTimelock;
			console.log("Fetched trading variables.");
		});
	}).catch(() => {
		setTimeout(() => { fetchTradingVariables(); }, 2*1000);
	});
}

setInterval(() => {
	fetchTradingVariables();
	fetchOpenTrades();
}, 60*10*1000);

// -----------------------------------------
// 6. SELECT NFT TO EXECUTE ORDERS
// -----------------------------------------

async function selectNft(){
	return new Promise(async resolve => {
		if(nftTimelock === undefined || nfts.length === 0){ resolve(null); return; }
		
		web3[selectedProvider].eth.net.isListening().then(async () => {
			const currentBlock = await web3[selectedProvider].eth.getBlockNumber();

			for(var i = 0; i < nfts.length; i++){
				const lastSuccess = await tradingContract.methods.nftLastSuccess(nfts[i].id).call();
				if(parseFloat(currentBlock) - parseFloat(lastSuccess) >= nftTimelock
				&& !nftsBeingUsed.includes(nfts[i].id)){
					console.log("Selected NFT #" + nfts[i].id);
					resolve(nfts[i]);
					return;
				}
			}

			console.log("No suitable NFT to select.");
			resolve(null);

		}).catch(() => {
			resolve(null);
		});
	});
}

// -----------------------------------------
// 7. LOAD OPEN TRADES
// -----------------------------------------

async function fetchOpenTrades(){
	web3[selectedProvider].eth.net.isListening().then(async () => {
		if(pairs.length === 0){
			setTimeout(() => { fetchOpenTrades(); }, 2*1000);
			return;
		}
		const openLimitOrdersCount = await tradingContract.methods.openLimitOrdersCount().call();
		let promisesPairTradersArray = [], promisesTrades = [];

		for(var i = 0; i < pairs.length; i++){
			promisesPairTradersArray.push(tradingContract.methods.pairTradersArray(i).call());
		}

		Promise.all(promisesPairTradersArray).then(async (r) => {
			for(var j = 0; j < r.length; j ++){
				for(var a = 0; a < r[j].length; a++){
					for(var b = 0; b < 3; b++){
						promisesTrades.push(tradingContract.methods.userTrades(r[j][a], j, b).call());
					}
				}
			}

			for(var l = 0; l < parseFloat(openLimitOrdersCount); l++){
				promisesTrades.push(tradingContract.methods.openLimitOrders(l).call());
			}

			Promise.all(promisesTrades).then((t) => {
				openTrades = [];
				for(var j = 0; j < t.length; j++){
					if(t[j].leverage.toString() === "0"){ continue; }
					openTrades.push(t[j]);
				}
				console.log("Fetched open trades: " + openTrades.length);
			});
		});
	}).catch(() => {
		setTimeout(() => { fetchOpenTrades(); }, 2*1000);
	});
}

// -----------------------------------------
// 8. WATCH TRADING EVENTS
// -----------------------------------------

function watchLiveTradingEvents(){
	web3[selectedProvider].eth.net.isListening().then(async () => {
		if(eventSubscription !== null){ return; }
		eventSubscription = tradingContract.events.allEvents({ fromBlock: 'latest' }).on('data', function (event){
			const eventName = event.event.toString();

			if(eventName !== "TradeOpenedMarket" && eventName !== "TradeCanceledMarket"
			&& eventName !== "TradeClosedMarket" && eventName !== "TradeLimitExecuted"
			&& eventName !== "TpSlUpdated" && eventName !== "TradeLimitOpened"
			&& eventName !== "TradeLimitCanceled"){
				return;
			}

			event.triedTimes = 1;

			setTimeout(() => {
				refreshOpenTrades(event);
			}, process.env.EVENT_CONFIRMATIONS_SEC*1000);
		});

		console.log("Watching trading events");
	}).catch(() => {
		setTimeout(() => { watchLiveTradingEvents(); }, 2*1000);
	});
}

// -----------------------------------------
// 9. REFRESH INTERNAL OPEN TRADES LIST
// -----------------------------------------

async function refreshOpenTrades(event){
	web3[selectedProvider].eth.net.isListening().then(async () => {
		const eventName = event.event.toString();
		let failed = false;

		if(eventName === "TradeLimitCanceled" || (eventName === "TradeLimitExecuted" && event.returnValues.orderType.toString() === "4")){
			const hasLimitOrder = await tradingContract.methods.hasOpenLimitOrder(event.returnValues.trader, event.returnValues.pairIndex).call();

			if(hasLimitOrder.toString() === "false"){
				for(var i = 0; i < openTrades.length; i++){
					if(openTrades[i].trader === event.returnValues.trader && openTrades[i].pairIndex === event.returnValues.pairIndex
					&& openTrades[i].hasOwnProperty('minPrice')){
						openTrades[i] = openTrades[openTrades.length-1];
						openTrades.pop();
						console.log("Watch events ("+eventName+"): Removed limit");
						break;
					}
				}
			}else{
				failed = true;
			}
		}
		if(eventName === "TradeLimitOpened"){
			const hasLimitOrder = await tradingContract.methods.hasOpenLimitOrder(event.returnValues.trader, event.returnValues.pairIndex).call();

			if(hasLimitOrder.toString() === "true"){
				const id = await tradingContract.methods.userOpenLimitOrderId(event.returnValues.trader, event.returnValues.pairIndex).call();
				const limit = await tradingContract.methods.openLimitOrders(id).call();
				let found = false;

				for(var i = 0; i < openTrades.length; i++){
					if(openTrades[i].trader === event.returnValues.trader && openTrades[i].pairIndex === event.returnValues.pairIndex
					&& openTrades[i].hasOwnProperty('minPrice')){
						openTrades[i] = limit;
						found = true;
						console.log("Watch events ("+eventName+"): Updated limit");
						break;
					}
				}

				if(!found){ 
					openTrades.push(limit); 
					console.log("Watch events ("+eventName+"): Added limit");
				}
			}else{
				failed = true;
			}
		}
		if(eventName === "TradeOpenedMarket" || (eventName === "TradeLimitExecuted" && event.returnValues.orderType.toString() === "4")
		|| eventName === "TpSlUpdated"){
			const trade = await tradingContract.methods.userTrades(event.returnValues.trader, event.returnValues.pairIndex, event.returnValues.userTradesIndex).call();
			
			if(parseFloat(trade.leverage) > 0){
				let found = false;

				for(var i = 0; i < openTrades.length; i++){
					if(openTrades[i].trader === event.returnValues.trader && openTrades[i].pairIndex === event.returnValues.pairIndex
					&& openTrades[i].userTradesIndex === event.returnValues.userTradesIndex && openTrades[i].hasOwnProperty('openPrice')){
						openTrades[i] = trade;
						found = true;
						console.log("Watch events ("+eventName+"): Updated trade");
						break;
					}
				}

				if(!found){ 
					openTrades.push(trade); 
					console.log("Watch events ("+eventName+"): Stored trade");
				}
			}else{
				failed = true;
			}
		}
		if((eventName === "TradeClosedMarket") || (eventName === "TradeLimitExecuted" && event.returnValues.orderType !== "4")){
			const trade = await tradingContract.methods.userTrades(event.returnValues.trader, event.returnValues.pairIndex, event.returnValues.userTradesIndex).call();

			if(parseFloat(trade.leverage) === 0){
				for(var i = 0; i < openTrades.length; i++){
					if(openTrades[i].trader === event.returnValues.trader && openTrades[i].pairIndex === event.returnValues.pairIndex
					&& openTrades[i].userTradesIndex === event.returnValues.userTradesIndex && openTrades[i].hasOwnProperty('openPrice')){
						openTrades[i] = openTrades[openTrades.length-1];
						openTrades.pop();
						console.log("Watch events ("+eventName+"): Removed trade");
						break;
					}
				}
			}else{
				failed = true;
			}
		}
		if(failed){
			if(event.triedTimes == 10){ return; }
			event.triedTimes ++;
			setTimeout(() => {
				refreshOpenTrades(event);
			}, process.env.EVENT_CONFIRMATIONS_SEC*1000);
			console.log("Watch events ("+eventName+"): Trade not found on the blockchain, trying again in "+process.env.EVENT_CONFIRMATIONS_SEC+" seconds.");
		}
	}).catch(() => { console.log("Error, WSS not connected."); });
}

// ---------------------------------------------
// 10. FETCH CURRENT PRICES & TRIGGER ORDERS
// ---------------------------------------------

socket.on("prices", async (p) => {
	if(pairs.length > 0 && allowedLink){
		for (let i = openTrades.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			const temp = openTrades[i];
			openTrades[i] = openTrades[j];
			openTrades[j] = temp;
		}

		for(var i = 0; i < openTrades.length; i++){
			const t = openTrades[i];
			t.userTradesIndex = t.userTradesIndex === undefined ? 0 : t.userTradesIndex;
			const price = p.lastPrices[t.pairIndex];
			const buy = t.buy.toString() === "true";
			let orderType = 0;

			if(t.openPrice !== undefined){
				const tp = parseFloat(t.tp)/1e10;
				const sl = parseFloat(t.sl)/1e10;
				const open = parseFloat(t.openPrice)/1e10;
				const lev = parseFloat(t.leverage);
				const liqPrice = buy ? open - 0.9/lev*open : open + 0.9/lev*open;

				if(tp.toString() !== "0" && ((buy && price >= tp) || (!buy && price <= tp))){
					orderType = 1;
				}else if(sl.toString() !== "0" && ((buy && price <= sl) || (!buy && price >= sl))){
					orderType = 2;
				}else if((buy && price <= liqPrice) || (!buy && price >= liqPrice)){
					orderType = 3;
				}
			}else{
				const spread = pairs[t.pairIndex].spreadP/1e10*(100-t.spreadReductionP)/100;
				const priceIncludingSpread = !buy ? price*(1-spread/100) : price*(1+spread/100);

				if(priceIncludingSpread >= parseFloat(t.minPrice)/1e10 && priceIncludingSpread <= parseFloat(t.maxPrice)/1e10){
					orderType = 4;
				}
			}

			if(orderType > 0 && !ordersTriggered.some(e => JSON.stringify(e) === JSON.stringify({trade: t, orderType: orderType}))){
				const nft = await selectNft();
				if(nft === null){ return; }

				ordersTriggered.push({trade: t, orderType: orderType});
				nftsBeingUsed.push(nft.id);

				const orderInfo = {nftId: nft.id, trade: t, type: orderType,
					name: orderType === 1 ? "TP" : orderType === 2 ? "SL" : orderType === 3 ? "LIQ" : "OPEN LIMIT"};

				console.log("Try to trigger (order type: " + orderInfo.name + ", nft id: "+orderInfo.nftId+")");

				tradingContract.methods.executeNftOrder(orderType, t.trader, t.pairIndex, t.userTradesIndex, nft.id, nft.type)
				.send({from: process.env.PUBLIC_KEY}).then(() => {
					console.log("Triggered (order type: " + orderInfo.name + ", nft id: "+orderInfo.nftId+")");
					setTimeout(() => {
						ordersTriggered = ordersTriggered.filter(item => JSON.stringify(item) !== JSON.stringify({trade:orderInfo.trade, orderType: orderInfo.type}));
						nftsBeingUsed = nftsBeingUsed.filter(item => item !== orderInfo.nftId);
					}, process.env.TRIGGER_TIMEOUT*1000);
				}).catch((e) => {
					console.log("Failed to trigger (order type: " + orderInfo.name + ", nft id: "+orderInfo.nftId+")");
					console.log("Tx error (" + e + ")");
					setTimeout(() => {
						ordersTriggered = ordersTriggered.filter(item => JSON.stringify(item) !== JSON.stringify({trade:orderInfo.trade, orderType: orderInfo.type}));
						nftsBeingUsed = nftsBeingUsed.filter(item => item !== orderInfo.nftId);
					}, process.env.TRIGGER_TIMEOUT/2*1000);
				});
			}
		}
	}
});

// -------------------------------------------------
// 11. CREATE SERVER (USEFUL FOR CLOUD PLATFORMS)
// -------------------------------------------------

const port = process.env.PORT || 4001;
server.listen(port, () => console.log(`Listening on port ${port}`));