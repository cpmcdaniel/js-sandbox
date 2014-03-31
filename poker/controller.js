var pokerApp = angular.module('pokerApp', []);

var CARD_REGEXP = /^([2-9]|10|[AJKQ])([cdhs])$/;

var RANK_MAP = {"2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, "J": 11, "Q": 12, "K": 13, "A": 14};

// Compares the rank of 2 cards.
function compareRank(a, b) {
  if (RANK_MAP[a.rank] < RANK_MAP[b.rank]) return -1;
  if (RANK_MAP[a.rank] > RANK_MAP[b.rank]) return 1;
  return 0;
}

// Creates a map of rank to number of occurrances.
function frequencies(cards) {
  var freqs = {};
  for (var i = 0; i < cards.length; i++) {
    if (!freqs[cards[i].rank])
      freqs[cards[i].rank] = 0;
    freqs[cards[i].rank]++;
  };
  return freqs;
}

// All cards of the same suit.
function flush(cards) {
  var suit = cards[0].suit;
  for (var i = 0; i < cards.length; i++) {
    if (cards[i].suit != suit) return false;
  };
  return "Flush";
}

// All cards are in sequence.
function straight(cards) {
  // Sort by rank.
  cards.sort(compareRank);

  var previousRank = RANK_MAP[cards[0].rank];
  for (var i = 1; i < cards.length; i++) {
    if (RANK_MAP[cards[i].rank] != previousRank + 1) return false;
    previousRank++;
  }

  return "Straight";
}

function straightFlush(cards) {
  if (straight(cards) && flush(cards))
    return "Straight Flush";
  return false; 
}

function fourOfAKind(cards) {
  var freqs = frequencies(cards);
  for (prop in freqs) {
    if (freqs[prop] == 4) return "Four of a Kind";
  }
  return false;
}

function threeOfAKind(cards) {
  var freqs = frequencies(cards);
  for (prop in freqs) {
    if (freqs[prop] == 3) return "Three of a Kind";
  }
  return false;
}

function onePair(cards) {
  var freqs = frequencies(cards);
  for (prop in freqs) {
    if (freqs[prop] == 2) return "One Pair";
  }
  return false;
}

// three of a kind and one pair.
function fullHouse(cards) {
  if (threeOfAKind(cards) && onePair(cards)) 
    return "Full House";
  return false;
}

function twoPair(cards) {
  var freqs = frequencies(cards);
  var pairs = 0;
  for (prop in freqs) {
    if (freqs[prop] == 2) pairs++;
  }
  
  if (pairs == 2) return "Two Pair";
  return false;
}

var rankFns = [straightFlush, 
               fourOfAKind, 
               fullHouse, 
               flush,
               straight,
               threeOfAKind,
               twoPair,
               onePair];

function rankHand(handString) {
    var inputs = handString.trim().split(/\s+/);
    
    // validate that there are 5 cards
    if (inputs.length != 5) {
      return "A poker hand must have 5 cards!";
    }

    // validate each card
    var cards = [];
    for (var i = 0; i < inputs.length; i++) {
      var match = CARD_REGEXP.exec(inputs[i]);
      if (!match) {
        return inputs[i] + " is not a valid card!";
      }

      cards.push({rank: match[1], suit: match[2]});
    };

    // each card should be unique
    var counts = inputs.reduce(function(acc, val, index, arr) {
      if (!acc[val]) acc[val] = 0;
      acc[val]++;
      return acc;
    }, {});
    for (prop in counts) {
      if (counts[prop] > 1)
        return "Are you trying to cheat?"
    }

    for (var i = 0; i < rankFns.length; i++) {
      var result = rankFns[i](cards);
      if (result) return result;
    };

    return "High card";
};

function makeSample(hand) {
  return {hand: hand, rank: rankHand(hand)};
}

pokerApp.controller('PokerHandCtrl', function ($scope) {
	$scope.hand = "As Ac 7d 10h 3s";

	$scope.message = rankHand($scope.hand);

	$scope.change = function() {
    $scope.message = rankHand($scope.hand);
	};

  var samples = ["5c 6c 7c 8c 9c", 
                 "Ac Ah Ad As Jd",
                 "Kc Kd Ks 3d 3c",
                 "Qc 3c 8c 9c Jc",
                 "2c 3c 4d 5s 6h",
                 "Js Jc Jd 5d 2c",
                 "As Ad 2c 2h 9d",
                 "As Ad 8c 2d 10c",
                 "Kh 10d 2s 3h 4c"];

  var temp = [];
  for (var i = 0; i < samples.length; i++) {
    temp.push(makeSample(samples[i]));
  }
  $scope.samples = temp;
});
