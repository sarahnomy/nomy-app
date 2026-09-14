export type EmotionizeOptionGroupKey = 'looks' | 'body' | 'afterwards';

export type EmotionizeStorySlide = {
  note: string;
  sub: string;
  optionGroup?: EmotionizeOptionGroupKey;
  options?: readonly string[];
  dynamicPattern?: boolean;
};

export type EmotionizeSelections = Record<EmotionizeOptionGroupKey, string[]>;

export const emotionizeCategories = [
  {
    "name": "High Energy",
    "description": "A lot is happening inside",
    "feelings": [
      "Excitement",
      "Curiosity",
      "Frustration",
      "Anxiety",
      "Anger",
      "Anticipation"
    ],
    "locked": [],
    "note": "A little note from Emotionize\nYou might have noticed something while reading these.\nHigh energy doesn't always mean feeling good.\nExcitement can make your body race.\nCuriosity can make your brain lock onto something.\nFrustration can make everything feel too loud.\nAnxiety can make you feel like you need to do something even when you don't know what.\nThey can look completely different.\nBut they can all leave you with the same question:\n“Why do I feel like this?”\nAnd sometimes the answer isn't that you're being dramatic, difficult, lazy, obsessive, too sensitive, or too much.\nSometimes your brain and body are simply telling you:\n“Something is happening here.”\nEmotionize is here to help you figure out what that something might be."
  },
  {
    "name": "Pleasant",
    "description": "Things feel good or settled",
    "feelings": [
      "Happiness",
      "Contentment",
      "Amusement",
      "Relief",
      "Gratitude"
    ],
    "locked": [],
    "note": ""
  },
  {
    "name": "Low Energy",
    "description": "Your energy is running low",
    "feelings": [
      "Exhaustion",
      "Numbness",
      "Overwhelm",
      "Shutdown",
      "Disconnection",
      "Burnout"
    ],
    "locked": [],
    "note": ""
  },
  {
    "name": "Vulnerable",
    "description": "Something feels exposed or hard to make sense of",
    "feelings": [
      "Sadness",
      "Embarrassment",
      "Shame",
      "Loneliness",
      "Uncertainty",
      "Confusion",
      "Insecurity"
    ],
    "locked": [],
    "note": ""
  }
] as const;

export const emotionizeStories = {
  "Excitement": [
    {
      "note": "Excitement",
      "sub": "You know when you find something you really, really like?\nMaybe it's a song.\nMaybe it's a new idea.\nMaybe you discover a book, a game, a place, a person, a hobby — and suddenly your brain has decided:\nThis. This is important.\nYou want to know everything.\nYou want to talk about it.\nYou want to tell someone.\nActually, you want to tell everyone.\n\nYou might start talking faster.\nYou might interrupt yourself because you suddenly remembered another thing.\nYour hands might start moving.\nMaybe you're pacing around the room.\nMaybe you're bouncing your legs.\nMaybe you're flapping your hands.\nMaybe you're making little sounds without even noticing.\nOr maybe none of that happens.\nMaybe you go completely quiet."
    },
    {
      "note": "Excitement continued",
      "sub": "Because sometimes excitement doesn't come out.\nIt just sits inside you, getting bigger and bigger.\nAnd then someone says,\n“You're very excited about this, aren't you?”\nAnd you think...\nAm I?\nBecause sometimes you don't realise how much you're feeling until your body is already doing something about it.\nAnd here's the strange thing about excitement:\nSometimes it feels amazing.\nAnd sometimes it feels like too much.\n\nYou can be thrilled about something and still need the lights turned down.\nYou can have the best time and suddenly need everyone to stop talking.\nYou can be so happy about something that you end up completely exhausted afterwards.\nThat doesn't mean you weren't excited.\nIt doesn't mean you secretly didn't enjoy yourself.\nSometimes your body just has a lot to process when something matters to you.\nAnd maybe you've spent years being told you're:\ntoo much.\nToo enthusiastic.\nToo intense.\nToo obsessed.\nToo excited."
    },
    {
      "note": "Excitement continued",
      "sub": "Maybe you learned to hide it.\nMaybe you started checking yourself before you showed anyone that you cared.\nBut excitement isn't something you have to apologise for.\nSometimes your brain just finds something wonderful...\n...and lights up.\nMaybe you don't need to make the light smaller.\nMaybe you just need to learn what happens when it gets bright."
    },
    {
      "note": "What does excitement look like for you?",
      "sub": "Choose anything that sounds familiar.",
      "optionGroup": "looks",
      "options": [
        "I talk more or much faster",
        "I stim more",
        "I want to move, pace, bounce or fidget",
        "I can't stop thinking about the thing",
        "I want to tell someone everything",
        "I become completely absorbed",
        "I laugh or make more sounds",
        "I feel like I have so much energy",
        "I go very quiet",
        "I find it hard to focus on anything else",
        "It can become too much",
        "I don't always realise I'm excited until afterwards"
      ]
    },
    {
      "note": "What does excitement feel like in your body?",
      "sub": "",
      "optionGroup": "body",
      "options": [
        "Buzzing or fizzy",
        "Warm",
        "Light",
        "Full of energy",
        "Restless",
        "Heart beating faster",
        "Tingling",
        "Like I need to move",
        "Like everything is happening at once",
        "I don't notice much in my body",
        "I'm not sure yet"
      ]
    },
    {
      "note": "What tends to happen afterwards?",
      "sub": "",
      "optionGroup": "afterwards",
      "options": [
        "I still feel energised",
        "I want to keep talking about it",
        "I need some quiet",
        "I want to be alone",
        "I feel physically tired",
        "I feel sensory overload",
        "I need to stim or move",
        "I \"crash\" afterwards",
        "I feel happy but completely drained",
        "It depends"
      ]
    },
    {
      "note": "You might be noticing a pattern",
      "sub": "You might be noticing a pattern\nYou chose that excitement can make you very energetic, increase your stimming, and leave you needing quiet afterwards.\nMaybe you've always thought:\n“Why do I get so tired when I'm having fun?”\nYou might be discovering that feeling good can still use a lot of energy.\nYour excitement isn't the problem.\nYou may just be learning how much space your excitement needs.",
      "dynamicPattern": true
    }
  ],
  "Curiosity": [
    {
      "note": "Curiosity",
      "sub": "You ask one question.\nThen another.\nThen another.\nActually...\nWait.\nHow does that work?\nAnd why does it work like that?\nAnd who decided that?\nAnd what happens if you change this part?\nAnd suddenly it's 2:13 in the morning and you're reading about something you had absolutely no reason to be researching.\n\nYou weren't planning to spend your evening learning about it.\nBut now you need to know.\nNot because someone told you to.\nBecause your brain has found a little door...\n...and it needs to know what's behind it.\nCuriosity can feel like a pull.\nSomething catches your attention and suddenly the rest of the room becomes a little less important.\n\nYou might lose track of time.\nYou might forget to eat.\nYou might forget that someone was talking to you.\nYou might open seventeen tabs.\nYou might tell someone everything you've just learned.\nYou might collect facts.\nYou might make connections that other people don't immediately see.\nAnd then someone says:\n“You're really into this.”\nYes.\nYes, you are."
    },
    {
      "note": "Curiosity continued",
      "sub": "Sometimes curiosity is lowkey.\nYou notice something.\nYou wonder about it.\nThen you move on.\nAnd sometimes it is more like a magnet.\nOnce your brain has decided something is interesting, good luck getting it to let go.\nThat can be wonderful.\nIt can also make ordinary life a little difficult.\nBecause your brain doesn't always care that you have work tomorrow.\nOr laundry to do.\nOr a message you haven't answered.\nIt has questions.\n\nAnd apparently those questions are now the most important thing in the world.\nYou might have been told that you're distracted.\nObsessed.\nToo focused on strange things.\nThat you should be doing something more useful.\nBut curiosity can be one of the ways your brain makes sense of the world.\nYou notice patterns.\nYou notice details.\nYou follow connections.\nYou want to understand how things fit together.\nAnd sometimes, when you find something that really clicks, it can feel almost like finding a missing puzzle piece."
    },
    {
      "note": "Curiosity continued",
      "sub": "Oh.\nSo that's how it works.\nThat little feeling?\nThat can be curiosity turning into understanding.\nAnd maybe you don't need to stop yourself from wondering.\nMaybe you just need to learn when to follow the rabbit hole...\n...and when to come back out."
    },
    {
      "note": "What does curiosity look like for you?",
      "sub": "",
      "optionGroup": "looks",
      "options": [
        "I ask lots of questions",
        "I need to understand how something works",
        "I research it deeply",
        "I fall down a rabbit hole",
        "I lose track of time",
        "I collect information",
        "I notice tiny details",
        "I connect things together",
        "I become completely absorbed",
        "I want to tell someone everything I've learned",
        "I find it hard to stop",
        "I forget what I was supposed to be doing"
      ]
    },
    {
      "note": "What does curiosity feel like in your body?",
      "sub": "",
      "optionGroup": "body",
      "options": [
        "Alert",
        "Energised",
        "Focused",
        "Restless",
        "A buzzing feeling",
        "Like I need to find the answer",
        "Like my brain is switched fully on",
        "Calm but intensely focused",
        "I don't notice anything physical",
        "I'm not sure yet"
      ]
    },
    {
      "note": "What tends to happen afterwards?",
      "sub": "",
      "optionGroup": "afterwards",
      "options": [
        "I feel satisfied",
        "I want to learn more",
        "I feel energised",
        "I feel mentally tired",
        "I realise I've lost hours",
        "I forget to eat or drink",
        "I struggle to switch to something else",
        "I feel frustrated when I have to stop",
        "I need some quiet afterwards",
        "I don't really notice an after-effect"
      ]
    },
    {
      "note": "You might be noticing a pattern",
      "sub": "You might be noticing a pattern\nYou chose that curiosity can make you lose track of time, become deeply absorbed, and find it difficult to stop.\nMaybe you've spent a lot of time calling yourself:\n“easily distracted.”\nBut perhaps your attention isn't always disappearing.\nSometimes it is going somewhere very specific.\nYou might be noticing that when something matters to your brain, it can become incredibly difficult to look away.",
      "dynamicPattern": true
    }
  ],
  "Frustration": [
    {
      "note": "Frustration",
      "sub": "You know what you want to do.\nYou can see it in your head.\nIt should be simple.\nSo why isn't it working?\nYou try again.\nStill doesn't work.\nYou explain what you mean.\nThey still don't understand.\nYou try to explain it another way.\nNow you're explaining the explanation.\nAnd somehow you're even more frustrated.\n\nMaybe the thing isn't even that big.\nMaybe it's a website that won't load.\nA drawer that won't close.\nSomeone moving your things.\nA plan changing at the last minute.\nA noise that won't stop.\nSomeone doing something differently from the way you expected.\nOr maybe it's something much bigger.\nYou don't know.\nYou just know that suddenly everything is irritating you.\n\nThe noise.\nThe light.\nThe questions.\nThe person breathing too loudly.\nThe fact that someone has asked you,\n“Why are you getting so worked up?”\nWhich, unfortunately, is not helping."
    },
    {
      "note": "Frustration continued",
      "sub": "Sometimes frustration feels like anger.\nSometimes it feels like restlessness.\nSometimes you want to cry.\nSometimes you want to scream.\nSometimes you want to throw something across the room.\nSometimes you want everyone to please stop talking to you.\nAnd sometimes you don't even realise you're frustrated.\nYou just know that you suddenly can't cope with one more thing.\n\nThis is where it can get confusing.\nBecause maybe the thing that finally makes you snap isn't actually the thing that started it.\nIt might be the fifth noise.\nThe tenth question.\nThe unexpected change.\nThe conversation you had earlier.\nThe uncomfortable clothes you've been wearing all day.\nThe meeting where you had to concentrate really hard.\nThe twenty-seven tiny things that your brain has been quietly dealing with.\nAnd then someone asks you to make one more decision.\nNope.\nDone."
    },
    {
      "note": "Frustration continued",
      "sub": "Sometimes frustration is not:\n“This one thing is unbearable.”\nSometimes it's:\n“I have reached the end of what I can handle.”\nAnd maybe you've been angry at yourself for that.\nMaybe you've called yourself dramatic.\nDifficult.\nImpatient.\nOverreactive.\n\nMaybe you thought you should have been able to handle it.\nBut your limit is still a limit.\nYou don't have to wait until you completely fall apart before you're allowed to have one.\nSometimes frustration is your body saying, “I need something to change.”\nAnd honestly?\nIt might be worth listening."
    },
    {
      "note": "What does frustration look like for you?",
      "sub": "",
      "optionGroup": "looks",
      "options": [
        "I become irritated by small things",
        "I get stuck on a problem",
        "I keep trying until I fix it",
        "I repeat myself",
        "I need things to happen a certain way",
        "I become more blunt or direct",
        "I talk more intensely",
        "I become very quiet",
        "I want everyone to stop talking",
        "I need to leave",
        "I feel like crying",
        "I don't notice I'm frustrated until I'm already overwhelmed"
      ]
    },
    {
      "note": "What does frustration feel like in your body?",
      "sub": "",
      "optionGroup": "body",
      "options": [
        "Tight jaw",
        "Tense shoulders",
        "Hot",
        "Restless",
        "Heart beating faster",
        "Pressure in my chest",
        "A knot in my stomach",
        "Like I need to move",
        "Like I want to explode",
        "Like I want to cry",
        "I don't notice anything physical",
        "I'm not sure yet"
      ]
    },
    {
      "note": "What tends to happen afterwards?",
      "sub": "",
      "optionGroup": "afterwards",
      "options": [
        "I feel relieved once it's over",
        "I need to be alone",
        "I need quiet",
        "I feel exhausted",
        "I replay what happened",
        "I feel guilty about how I reacted",
        "I feel embarrassed",
        "I shut down",
        "I still feel irritated",
        "I need to stim or move",
        "I don't really know"
      ]
    },
    {
      "note": "You might be noticing a pattern",
      "sub": "You might be noticing a pattern\nYou chose that frustration often appears when things don't go as expected, and that you need space afterwards.\nMaybe what feels like “getting angry over nothing” isn't actually about nothing.\nSometimes frustration is the last thing added to an already-full day.\nYou might be learning to notice your limit before you reach it.",
      "dynamicPattern": true
    }
  ],
  "Anxiety": [
    {
      "note": "Anxiety",
      "sub": "You wake up.\nNothing is wrong.\nAs far as you know.\nBut something feels...\noff.\nYou check your phone.\nNothing.\nYou think about tomorrow.\nFine.\nYou think about that conversation from yesterday.\nMaybe fine.\nYou check again.\nStill nothing.\nAnd yet your brain has started quietly making a list.\n\nWhat if something goes wrong?\nWhat if I misunderstood?\nWhat if they are annoyed with me?\nWhat if I forgot something?\nWhat if I don't know what to do?\nWhat if I can't leave?\nWhat if something changes?\nAnd now you're thinking about all of those things at the same time.\n\nMaybe your heart is beating faster.\nMaybe your stomach feels strange.\nMaybe you feel hot.\nMaybe you can't sit still.\nMaybe you need to walk around.\nMaybe you start checking things.\nMaybe you ask someone for reassurance.\nMaybe you make a plan.\nThen another plan.\nThen a backup plan.\nThen a backup plan for the backup plan.\nJust in case."
    },
    {
      "note": "Anxiety continued",
      "sub": "And sometimes anxiety doesn't feel like fear.\nSometimes it feels like energy.\nA horrible, buzzing kind of energy.\nThe kind that makes you want to move because sitting still with the feeling is somehow worse.\nSometimes you might even look calm.\nYou're answering questions.\nYou're smiling.\nYou're getting things done.\nNobody knows that your brain is running seventeen emergency meetings in the background.\nAnd sometimes you don't know either.\nYou just know that you can't settle.\n\nYou might think:\nWhy am I like this?\nNothing is even happening.\nBut your body doesn't always wait for something terrible to happen before it reacts.\nUncertainty can be enough.\nA change in plans.\nA new place.\nA conversation you can't predict.\nNot knowing what someone expects from you.\nNot knowing how long something will last.\nNot knowing when you can leave.\nSometimes not knowing is the difficult part."
    },
    {
      "note": "Anxiety continued",
      "sub": "And maybe you've spent years calling this overthinking.\nMaybe you tell yourself to calm down.\nMaybe other people tell you,\n“You're worrying about nothing.”\nBut the feeling is still there.\nYou don't have to prove that your anxiety makes sense before you're allowed to notice it.\nSometimes the first step is simply:\n“Something in me doesn't feel safe or certain right now.”\n\nAnd then you can ask:\nWhat would make this feel a little more predictable?\nMaybe you need information.\nMaybe you need a plan.\nMaybe you need quiet.\nMaybe you need someone you trust.\nMaybe you need to know that you can leave.\nMaybe you need nothing at all except a little time.\nYou don't have to solve the entire future tonight.\nYou just have to come back to where you are.\nRight here.\nRight now."
    },
    {
      "note": "What does anxiety look like for you?",
      "sub": "",
      "optionGroup": "looks",
      "options": [
        "I think about what could go wrong",
        "I replay conversations",
        "I make lots of plans",
        "I need to know what will happen",
        "I check things repeatedly",
        "I ask for reassurance",
        "I research beforehand",
        "I imagine lots of possible outcomes",
        "I find it hard to make decisions",
        "I become very quiet",
        "I look calm even when I'm not",
        "I can't stop thinking"
      ]
    },
    {
      "note": "What does anxiety feel like in your body?",
      "sub": "",
      "optionGroup": "body",
      "options": [
        "Tight chest",
        "Fast heartbeat",
        "Tense muscles",
        "Restlessness",
        "Buzzing",
        "Feeling hot",
        "Feeling shaky",
        "Knot in my stomach",
        "Like I need to escape",
        "Like I need to do something",
        "I don't notice anything physical",
        "I'm not sure yet"
      ]
    },
    {
      "note": "What tends to happen afterwards?",
      "sub": "",
      "optionGroup": "afterwards",
      "options": [
        "I feel relieved",
        "I feel completely drained",
        "I need to be alone",
        "I need quiet",
        "I keep replaying everything",
        "I sleep",
        "I stim more",
        "I feel numb",
        "I realise I was anxious only afterwards",
        "I feel embarrassed about how anxious I was",
        "I don't really know"
      ]
    },
    {
      "note": "You might be noticing a pattern",
      "sub": "You might be noticing a pattern\nYou chose that anxiety often shows up when you don't know what is going to happen, and that you respond by planning, checking or trying to prepare.\nMaybe you've always called this overthinking.\nMaybe some of it is your brain trying to make the unknown feel a little more manageable.\nYou might be noticing that knowing what to expect helps your body settle.\nAnd that's useful information to have about yourself.",
      "dynamicPattern": true
    }
  ],
  "Anger": [
    {
      "note": "Anger",
      "sub": "It starts with something small.\nSomeone interrupts you.\nSomeone changes the plan.\nSomeone touches your things.\nSomeone says something that doesn't make sense.\nSomeone keeps asking you questions when you've already said you need a minute.\nAnd suddenly...\nNO.\nYou can feel it.\nYour jaw gets tight.\nYour shoulders go up.\nYour chest feels hot.\nYour thoughts get faster.\nYou want to say exactly what you're thinking.\nMaybe you do.\nMaybe you don't.\nMaybe you go very quiet instead.\nYou stop answering.\nYou leave the room.\nYou put your headphones on.\nYou shut the door.\nAnd sometimes, five minutes later, you think:\nWhy was I so angry?\nHere's the annoying thing about anger.\nIt doesn't always arrive with a little label saying:\nHELLO. I AM ANGRY.\nSometimes it looks like irritation.\nSometimes it looks like crying.\nSometimes it looks like wanting everyone to leave you alone.\nSometimes it looks like suddenly being unable to make one more decision.\nSometimes it looks like a headache.\nSometimes it looks like pacing around the room because sitting still is absolutely not happening.\nAnd sometimes...\nyou're not actually angry about the thing you think you're angry about.\nMaybe someone moved your stuff.\nBut you were already tired.\nYou'd had a noisy day.\nYou'd been answering questions for hours.\nYour plans changed twice.\nYou'd been trying really hard to hold yourself together.\nAnd then someone moved your mug.\nThe mug was simply the last straw.\nThat doesn't mean the mug wasn't annoying.\nIt just means your anger might have arrived carrying a much bigger suitcase.\nSometimes anger is what happens when your system has had enough.\nEnough noise.\nEnough people.\nEnough pretending you're fine.\nEnough trying to explain yourself.\nEnough changes.\nEnough being misunderstood.\nAnd maybe you've been taught that anger is something to be ashamed of.\nSomething ugly.\nSomething you need to get rid of.\nBut anger isn't always the problem.\nSometimes anger is information.\nIt can tell you:\nSomething isn't okay.\nSomething hurts.\nSomething is too much.\nSomething needs to change.\nOf course, what you do with anger matters.\nYou don't have to hurt yourself or someone else to prove that you're angry.\nYou can leave.\nYou can stim.\nYou can be quiet.\nYou can write it down.\nYou can say, “I need a minute.”\nYou can come back when your body has stopped shouting.\nBecause maybe the goal isn't to never feel angry.\nMaybe the goal is to notice it before the mug becomes the whole suitcase."
    },
    {
      "note": "What does anger look like for you?",
      "sub": "",
      "optionGroup": "looks",
      "options": [
        "I become irritated very quickly",
        "Small things suddenly feel huge",
        "I become blunt or direct",
        "I talk more sharply",
        "I raise my voice",
        "I become very quiet",
        "I want everyone to leave me alone",
        "I need to get out of the situation",
        "I stim more",
        "I cry",
        "I want to pace or move",
        "I don't realise I'm angry until afterwards"
      ]
    },
    {
      "note": "What does anger feel like in your body?",
      "sub": "",
      "optionGroup": "body",
      "options": [
        "Hot",
        "Tight jaw",
        "Tense shoulders",
        "Clenched fists",
        "Fast heartbeat",
        "Pressure in my chest",
        "Restless",
        "Like I might explode",
        "Like I need to move",
        "Like I want to cry",
        "Like everything feels too loud",
        "I don't notice much physically"
      ]
    },
    {
      "note": "What tends to happen afterwards?",
      "sub": "",
      "optionGroup": "afterwards",
      "options": [
        "I feel relieved",
        "I feel exhausted",
        "I need complete quiet",
        "I want to be alone",
        "I feel guilty",
        "I feel embarrassed",
        "I replay what happened",
        "I shut down",
        "I feel numb",
        "I still feel angry",
        "I need time before I can talk about it"
      ]
    },
    {
      "note": "You might be noticing a pattern",
      "sub": "You might be noticing a pattern\nYou chose that anger often appears alongside sensory discomfort, changes, frustration or feeling like you've reached your limit.\nMaybe you have spent a lot of time thinking:\n“Why am I getting so angry about such a small thing?”\nThe thing might not have been small to your nervous system.\nIt might have simply been the last thing.\nYou might be learning that anger can be a signal:\nSomething is too much.\nAnd noticing that signal earlier might help you understand what you need before you reach the point of no return.",
      "dynamicPattern": true
    }
  ],
  "Anticipation": [
    {
      "note": "Anticipation",
      "sub": "Something is happening tomorrow.\nMaybe you're excited.\nMaybe you're nervous.\nMaybe you're both.\nYou start thinking about it.\nThen thinking about it again.\nYou imagine what it will be like.\nYou wonder what you'll wear.\nWhat time you'll leave.\nWhere you'll go.\nWho will be there.\nWhat will happen when you arrive.\nWhat happens if you're early?\nWhat happens if you're late?\nWhat if you don't know where to stand?\nWhat if you don't know what to say?\nWhat if everything goes perfectly?\nAnd now you've thought about tomorrow so many times that, somehow, you've already lived it.\nThis is anticipation.\nThat feeling of something coming towards you while your brain is already running ahead to meet it.\nSometimes it's wonderful.\nA holiday.\nA concert.\nSeeing someone you love.\nA new project.\nSomething you've been looking forward to for weeks.\nYou might count down the days.\nYou might keep checking the time.\nYou might talk about it constantly.\nYou might feel like you can barely contain yourself.\nAnd sometimes anticipation is less fun.\nAn appointment.\nA difficult conversation.\nA new place.\nA social event.\nSomething you've never done before.\nNow your brain starts asking questions.\nWhat if?\nWhat happens if?\nWhat happens after that?\nAnd suddenly you're planning every possible version of the next few hours.\nMaybe you need to know the route.\nMaybe you look at pictures of the place beforehand.\nMaybe you check the menu.\nMaybe you want to know exactly who will be there.\nMaybe you plan what you're going to say.\nMaybe you need to know when you can leave.\nAnd if someone suddenly says,\n“Oh, actually, we've changed the plan.”\n...\nAbsolutely not.\nBecause your brain had already built the whole little map.\nAnd now someone has moved the roads.\nSometimes people see this and think you're worrying too much.\nOr being controlling.\nOr making a big deal out of something that hasn't even happened yet.\nBut anticipation can be your brain trying to make the unknown feel a little less unknown.\nIf you know what is coming, you can prepare.\nYou can rehearse.\nYou can picture it.\nYou can work out where the tricky bits might be.\nYou can make a plan.\nAnd sometimes that preparation helps you feel safe enough to actually enjoy the thing.\nBut there can be a point where preparation stops helping.\nYou check one more time.\nThen again.\nYou replay the conversation.\nYou imagine every possible outcome.\nYou can't sleep because tomorrow is already happening inside your head.\nThat's when anticipation can become exhausting.\nAnd here's the strange part:\nThe thing you're waiting for hasn't even happened yet.\nBut your body has already spent energy dealing with it.\nSo maybe you don't need to stop anticipating.\nMaybe you just need to notice when your brain has done enough preparation.\nThe bag is packed.\nThe route is checked.\nThe plan is made.\nYou don't need to solve tomorrow tonight.\nTomorrow can arrive when it's ready."
    },
    {
      "note": "What does anticipation look like for you?",
      "sub": "",
      "optionGroup": "looks",
      "options": [
        "I think about what's coming over and over",
        "I count down",
        "I research",
        "I make plans",
        "I rehearse conversations",
        "I plan what I'll wear or bring",
        "I imagine different outcomes",
        "I need to know what will happen",
        "I keep checking the time",
        "I talk about it a lot",
        "I find changes to the plan difficult",
        "I struggle to think about anything else"
      ]
    },
    {
      "note": "What does anticipation feel like in your body?",
      "sub": "",
      "optionGroup": "body",
      "options": [
        "Buzzing",
        "Restless",
        "Excited",
        "Nervous",
        "Tense",
        "Warm",
        "Fast heartbeat",
        "Butterflies",
        "Like I need to move",
        "Like I can't settle",
        "A strange mix of excitement and anxiety",
        "I'm not sure yet"
      ]
    },
    {
      "note": "What tends to happen afterwards?",
      "sub": "",
      "optionGroup": "afterwards",
      "options": [
        "I feel excited and energised",
        "I feel relieved",
        "I feel exhausted",
        "I need quiet",
        "I need to be alone",
        "I feel overwhelmed",
        "I realise I spent hours thinking about it",
        "I find it hard to switch back to normal life",
        "I feel disappointed if reality is different from what I imagined",
        "I feel calm once I know what will happen",
        "It depends"
      ]
    },
    {
      "note": "You might be noticing a pattern",
      "sub": "You might be noticing a pattern\nYou chose that anticipation makes you plan, rehearse and think ahead, especially when you don't know exactly what is going to happen.\nMaybe you've thought of this as being too much or too controlling.\nBut perhaps preparation helps your brain turn:\n“I don't know what's coming.”\ninto:\n“Okay. I have some idea what to expect.”\nAnd you might have noticed something else too.\nAnticipation can feel like excitement and anxiety at the same time.\nYou don't always have to choose one.\nSometimes your body just knows:\n“Something is coming.”",
      "dynamicPattern": true
    }
  ],
  "Happiness": [
    {
      "note": "Happiness",
      "sub": "You know that feeling when you find something you really, really like?\nMaybe it's a song.\nMaybe it's a new idea.\nMaybe you've found the exact snack you've been craving.\nMaybe someone you love sends you a message at exactly the right moment.\nAnd suddenly...\nthere's this little spark inside you.\nYou smile.\nMaybe you laugh.\nMaybe you start talking much faster because you have to tell someone what happened.\nMaybe your hands start moving.\nMaybe you stim.\nMaybe you want to pace around while you explain why this thing is so good.\nOr maybe you don't do any of those things.\nMaybe you're just sitting there.\nQuietly happy.\nAnd nobody would know.\nSometimes happiness is much smaller than people make it sound.\nIt's getting into bed when the sheets are clean.\nIt's your favourite mug.\nIt's a room with the lights turned down.\nIt's finding the right texture.\nIt's finishing something you've been working on.\nIt's being alone and not feeling lonely.\nIt's being with someone you trust and realising you haven't been thinking about what your face looks like.\nYou haven't been wondering when to laugh.\nYou haven't been rehearsing what to say.\nYou're just...\nthere.\nAnd sometimes that's what happiness feels like.\nNot having to try so hard.\nYou might also notice something strange.\nYou can be incredibly happy and still need to go home.\nYou can love spending time with someone and still need the rest of the evening to yourself.\nYou can have an amazing day and feel completely exhausted afterwards.\nThat doesn't mean you weren't happy.\nSometimes your body has been busy feeling everything.\nThe sounds.\nThe conversations.\nThe excitement.\nThe people.\nThe movement.\nThe good bits too.\nGood feelings can take energy.\nMaybe you've spent years wondering why you need to recover from things you enjoyed.\nMaybe now you can look at it differently.\nYou had fun.\nYou were happy.\nAnd your body still needed rest.\nBoth can be true.\nMaybe happiness isn't always a giant feeling.\nMaybe sometimes it's just:\n“I like being here.”\nAnd honestly?\nThat counts."
    },
    {
      "note": "What does happiness look like for you?",
      "sub": "",
      "optionGroup": "looks",
      "options": [
        "I smile or laugh",
        "I talk more",
        "I stim more",
        "I want to move around",
        "I become very excited about something",
        "I want to tell someone",
        "I become very quiet",
        "I want to enjoy it by myself",
        "I feel more like myself",
        "I don't show much on the outside",
        "I don't always know when I'm happy"
      ]
    },
    {
      "note": "What does happiness feel like in your body?",
      "sub": "",
      "optionGroup": "body",
      "options": [
        "Warm",
        "Light",
        "Relaxed",
        "Calm",
        "Energised",
        "Tingly or fizzy",
        "Comfortable",
        "Like I want to move",
        "Like I can finally breathe",
        "I don't notice anything physical",
        "I'm not sure yet"
      ]
    },
    {
      "note": "What tends to happen afterwards?",
      "sub": "",
      "optionGroup": "afterwards",
      "options": [
        "I still feel good",
        "I feel energised",
        "I want to share the feeling with someone",
        "I want some quiet",
        "I want to be alone",
        "I feel tired",
        "I feel overwhelmed",
        "I need to stim",
        "I want to experience it again",
        "I don't notice a pattern yet"
      ]
    },
    {
      "note": "You might be noticing a pattern",
      "sub": "You might be noticing a pattern\nYou chose that happiness sometimes makes you feel more like yourself, but that you may also need quiet or recovery afterwards.\nMaybe you've been measuring happiness by how much you want to do.\nMaybe happiness for you is sometimes much simpler:\nFeeling safe enough to just be.",
      "dynamicPattern": true
    }
  ],
  "Contentment": [
    {
      "note": "Contentment",
      "sub": "Nothing particularly exciting is happening.\nAnd that's the nice part.\nThe day is going exactly how you expected it to.\nYour favourite things are where you left them.\nYour plans are still your plans.\nNobody needs anything from you right now.\nMaybe you're sitting somewhere comfortable.\nYou've got your favourite drink.\nThe room feels right.\nThe temperature is right.\nThe lights aren't annoying.\nThere isn't a strange noise coming from somewhere you can't find.\nYou look around and think:\nYep.\nThis is good.\nNot amazing.\nNot thrilling.\nJust...\ngood.\nAnd sometimes that feeling can be surprisingly difficult to notice.\nBecause we're used to looking for big emotions.\nHappy.\nSad.\nExcited.\nAngry.\nContentment is quieter.\nIt doesn't shout.\nIt doesn't demand attention.\nIt just sits there.\nAnd maybe that's why you like it.\nFor some people, contentment can feel especially good when things are predictable.\nYou know what is happening.\nYou know what's coming next.\nYou don't have to keep checking.\nYou don't have to prepare for a surprise.\nYou don't have to work out what somebody means.\nYou don't have to perform.\nYou can simply exist inside a moment that feels right.\nMaybe it's your morning routine.\nMaybe it's being wrapped in a blanket.\nMaybe it's organising something exactly how you like it.\nMaybe it's doing the same hobby you've done a hundred times.\nMaybe it's sitting next to someone without talking.\nMaybe it's being completely alone.\nThere is no rule saying happiness has to be exciting.\nSometimes the nicest feeling in the world is:\n“Nothing needs fixing right now.”\nAnd if you've spent a lot of your life feeling like you should be doing more, feeling more, socialising more, achieving more...\ncontentment can feel almost strange.\nYou might wonder:\nIs this it?\nMaybe.\nMaybe “it” is actually pretty lovely."
    },
    {
      "note": "What does contentment look like for you?",
      "sub": "",
      "optionGroup": "looks",
      "options": [
        "I enjoy my usual routines",
        "I like knowing what to expect",
        "I feel comfortable in my surroundings",
        "I want to stay where I am",
        "I enjoy being alone",
        "I enjoy being quietly with someone",
        "I get absorbed in something familiar",
        "I feel no need to do anything else",
        "I notice small things that feel good",
        "I feel settled",
        "I'm not sure what contentment looks like for me"
      ]
    },
    {
      "note": "What does contentment feel like in your body?",
      "sub": "",
      "optionGroup": "body",
      "options": [
        "Relaxed",
        "Warm",
        "Heavy in a comfortable way",
        "Calm",
        "Safe",
        "Soft or loose",
        "Quiet inside",
        "Comfortable enough to stay still",
        "Like I can finally breathe",
        "I don't notice anything physical",
        "I'm not sure yet"
      ]
    },
    {
      "note": "What tends to happen afterwards?",
      "sub": "",
      "optionGroup": "afterwards",
      "options": [
        "I stay in the feeling for a while",
        "I feel rested",
        "I become sleepy",
        "I want to keep doing what I'm doing",
        "I want some alone time",
        "I feel ready for whatever comes next",
        "I don't want the situation to change",
        "I feel a little sad when it ends",
        "Nothing much happens",
        "I don't really notice"
      ]
    },
    {
      "note": "You might be noticing a pattern",
      "sub": "You might be noticing a pattern\nYou chose that familiarity, predictability and comfort help you feel content.\nMaybe you've been looking for happiness in big moments.\nBut your brain might actually love the little ones.\nThe familiar song.\nThe same mug.\nThe predictable morning.\nThe person who knows when you don't want to talk.\nContentment is allowed to be enough.",
      "dynamicPattern": true
    }
  ],
  "Amusement": [
    {
      "note": "Amusement",
      "sub": "Someone says something ridiculous.\nYou try not to laugh.\nYou fail.\nNow you're laughing even more because you're trying to explain why it's funny.\nAnd somehow explaining it has made it worse.\nYou look at the person.\nThey look at you.\nYou both start laughing again.\nOr maybe amusement looks completely different for you.\nMaybe it's sending your friend a meme and waiting for them to understand why it is the funniest thing you've ever seen.\nMaybe you love very specific humour.\nVery dry humour.\nVery weird humour.\nVery dark humour.\nVery silly humour.\nMaybe you find something funny that nobody else seems to understand.\nMaybe you laugh at the same joke fifty times because, honestly, it's still funny.\nAnd sometimes amusement is quiet.\nA tiny smile.\nA funny thought that keeps popping back into your head.\nA ridiculous observation you make while everyone else is talking.\nMaybe you don't always laugh when something is funny.\nMaybe you just think:\nThat's good.\nAnd move on.\nThere can also be a funny little problem with amusement.\nSometimes you laugh when you're nervous.\nSometimes you laugh because you don't know what else to do.\nSometimes other people think you're laughing at them when you aren't.\nSometimes you laugh at exactly the wrong moment.\nAnd then you have to explain:\n“I'm not laughing because this is funny.”\nWhich, of course, makes everything much more awkward.\nYour outside reaction doesn't always tell the whole story.\nAnd that's okay.\nAmusement doesn't have to look like a perfect sitcom laugh.\nSometimes it's just that little moment where your brain goes:\n“Oh, that's good.”"
    },
    {
      "note": "What does amusement look like for you?",
      "sub": "",
      "optionGroup": "looks",
      "options": [
        "I laugh easily",
        "I laugh loudly",
        "I smile",
        "I make jokes",
        "I send things to people because I find them funny",
        "I repeat jokes I love",
        "I have very specific humour",
        "I laugh at things other people don't find funny",
        "I get the giggles",
        "I don't show much when I find something funny",
        "Sometimes I laugh when I'm nervous or uncomfortable"
      ]
    },
    {
      "note": "What does amusement feel like in your body?",
      "sub": "",
      "optionGroup": "body",
      "options": [
        "Light",
        "Warm",
        "Buzzy",
        "Energetic",
        "Relaxed",
        "Like I need to laugh",
        "Like I can't stop smiling",
        "A fizzy feeling in my chest or stomach",
        "I don't notice anything physical",
        "I'm not sure yet"
      ]
    },
    {
      "note": "What tends to happen afterwards?",
      "sub": "",
      "optionGroup": "afterwards",
      "options": [
        "I keep thinking about it",
        "I want to share it with someone",
        "I feel more relaxed",
        "I feel energised",
        "I keep laughing",
        "I become quiet again",
        "I feel tired from laughing",
        "I want more of the same kind of humour",
        "Nothing much happens",
        "I'm not sure"
      ]
    },
    {
      "note": "You might be noticing a pattern",
      "sub": "You might be noticing a pattern\nYou chose that amusement often shows up through specific kinds of humour, sharing things with people, or getting absorbed in something you find funny.\nMaybe your sense of humour doesn't always match everyone else's.\nThat's okay.\nYou don't need everyone to find something funny for it to be funny to you.\nAnd if you've ever laughed at the “wrong” moment because your body didn't know what else to do...\nyou're definitely not the only one.",
      "dynamicPattern": true
    }
  ],
  "Relief": [
    {
      "note": "Relief",
      "sub": "You have been waiting.\nWaiting for the appointment.\nWaiting for the answer.\nWaiting for the person to reply.\nWaiting for the difficult conversation to be over.\nWaiting for the thing you've been worrying about to finally happen.\nAnd then...\nit's done.\nNothing dramatic happens.\nYou just breathe out.\nMaybe you didn't even realise you were holding your breath.\nYour shoulders drop.\nYour jaw unclenches.\nYou sit down.\nAnd for a moment, there is nothing you need to solve.\nIt's over.\nRelief can be a funny feeling because you might not realise how tense you were until you aren't anymore.\nMaybe you thought you were fine.\nYou were functioning.\nYou were answering messages.\nYou were getting things done.\nBut then the uncertainty disappears...\nand suddenly you're exhausted.\nYou might cry.\nYou might laugh.\nYou might want to sleep.\nYou might need to be alone.\nYou might feel almost empty for a little while.\nThat's okay.\nSometimes your body waits until it knows you're safe before it lets everything out.\nAnd relief doesn't always come after something terrible.\nIt can be something much smaller.\nYour plans are finally confirmed.\nYou found the thing you lost.\nSomeone understood what you were trying to explain.\nYou got home.\nThe noise stopped.\nThe social event ended.\nYou finally took your uncomfortable clothes off.\nYou can stop pretending you're okay.\nYou can stop thinking about what you're supposed to do next.\nAnd suddenly:\nAh.\nThere you are.\nMaybe relief is your body saying:\n“We can put that down now.”"
    },
    {
      "note": "What does relief look like for you?",
      "sub": "",
      "optionGroup": "looks",
      "options": [
        "I breathe out deeply",
        "My shoulders drop",
        "I become very quiet",
        "I want to sit or lie down",
        "I want to be alone",
        "I laugh",
        "I cry",
        "I suddenly feel very tired",
        "I stop checking or worrying",
        "I want to do something comforting",
        "I don't realise I'm relieved straight away"
      ]
    },
    {
      "note": "What does relief feel like in your body?",
      "sub": "",
      "optionGroup": "body",
      "options": [
        "My muscles relax",
        "My chest feels lighter",
        "I can breathe more easily",
        "Warm",
        "Heavy",
        "Sleepy",
        "Calm",
        "Like a weight has disappeared",
        "Like I can finally stop",
        "I don't notice anything physical",
        "I'm not sure yet"
      ]
    },
    {
      "note": "What tends to happen afterwards?",
      "sub": "",
      "optionGroup": "afterwards",
      "options": [
        "I feel calm",
        "I feel sleepy",
        "I feel exhausted",
        "I need quiet",
        "I want to be alone",
        "I want comfort",
        "I suddenly realise how stressed I was",
        "I cry",
        "I feel happy",
        "I need time to recover"
      ]
    },
    {
      "note": "You might be noticing a pattern",
      "sub": "You might be noticing a pattern\nYou chose that relief often comes with a deep exhale, tiredness and wanting quiet afterwards.\nMaybe you have been wondering why you feel exhausted after something stressful ends.\nSometimes the body holds itself together while you're getting through something.\nAnd when it's finally over...\nit lets go.\nThat tiredness doesn't mean you handled it badly.\nIt might mean you were holding a lot.",
      "dynamicPattern": true
    }
  ],
  "Gratitude": [
    {
      "note": "Gratitude",
      "sub": "Someone remembers something about you.\nNot something huge.\nJust something small.\nThey remember that you don't like that particular food.\nThey know you need a little warning before plans change.\nThey send you the thing they know you'll love.\nThey leave the light off because they know it's been a long day.\nThey don't ask you to explain why you need to leave early.\nThey just say:\n“Of course.”\nAnd something inside you softens.\nThat's gratitude.\nSometimes it's directed at another person.\nSometimes it's directed at life.\nSometimes it's much smaller.\nThe perfect cup of tea.\nA quiet morning.\nA favourite song.\nA pet climbing onto your lap.\nA friend who lets you talk about the same interest for the hundredth time.\nA room where you can finally take your mask off.\nYou might feel gratitude very deeply without saying much about it.\nYou might struggle to find the right words.\nYou might show it by remembering something about the other person.\nDoing something thoughtful.\nSending them something later.\nShowing up.\nSometimes people expect gratitude to look like a big reaction.\nBut maybe yours doesn't.\nMaybe you feel it quietly.\nMaybe you think about it later.\nMaybe you don't realise how much something meant to you until you're alone.\nAnd sometimes gratitude can feel almost overwhelming.\nBecause when someone finally understands something you've spent years explaining...\nthat can be a big feeling.\nMaybe you aren't just grateful for what they did.\nMaybe you're grateful that, for once, you didn't have to explain yourself."
    },
    {
      "note": "What does gratitude look like for you?",
      "sub": "",
      "optionGroup": "looks",
      "options": [
        "I say thank you",
        "I want to do something kind in return",
        "I remember small details about people",
        "I want to share something with them",
        "I send a message later",
        "I become emotional",
        "I feel it quietly",
        "I find it difficult to put into words",
        "I show it through actions",
        "I want to hold onto the moment",
        "I don't always realise I'm grateful straight away"
      ]
    },
    {
      "note": "What does gratitude feel like in your body?",
      "sub": "",
      "optionGroup": "body",
      "options": [
        "Warm",
        "Soft",
        "Light",
        "Calm",
        "Full in my chest",
        "Tingly",
        "Emotional",
        "Like I want to smile",
        "Like I want to hug someone",
        "I don't notice anything physical",
        "I'm not sure yet"
      ]
    },
    {
      "note": "What tends to happen afterwards?",
      "sub": "",
      "optionGroup": "afterwards",
      "options": [
        "I feel connected to someone",
        "I want to give something back",
        "I think about the moment later",
        "I feel calm",
        "I feel emotional",
        "I want to be close to the person",
        "I feel energised",
        "I feel a little overwhelmed",
        "I become quiet",
        "Nothing much happens",
        "I'm not sure yet"
      ]
    },
    {
      "note": "You might be noticing a pattern",
      "sub": "You might be noticing a pattern\nYou chose that gratitude often shows up through small details, thoughtful actions and feeling understood.\nMaybe you don't always say:\n“That meant so much to me.”\nMaybe you show it another way.\nYou remember.\nYou notice.\nYou return the kindness.\nYou keep the little thing they did somewhere in your mind.\nThat is a way of feeling, too.\nAnd maybe being understood is one of the things you value most.",
      "dynamicPattern": true
    }
  ],
  "Exhaustion": [
    {
      "note": "Exhaustion",
      "sub": "You get home.\nYou take your shoes off.\nAnd then you just...\nsit there.\nYou meant to make dinner.\nYou meant to answer that message.\nYou meant to put the laundry away.\nYou might even have told yourself:\n“I'll do it in five minutes.”\nThree hours later, you're still sitting there.\nAnd maybe you're annoyed with yourself.\nBecause you weren't doing anything.\nYou weren't running a marathon.\nYou weren't doing anything difficult.\nSo why are you this tired?\nSometimes exhaustion isn't just about being sleepy.\nSometimes it's your whole body saying:\n“I don't have anything left.”\nTalking feels like work.\nMaking a decision feels like work.\nGetting dressed feels like work.\nSomeone asking,\n“What do you want for dinner?”\nfeels like an unreasonable question.\nYou don't know.\nYou don't want to know.\nYou just want someone else to decide.\nMaybe you lie in bed scrolling because it's the only thing you can manage.\nMaybe you put the same show on for the hundredth time because you don't have the energy to process something new.\nMaybe you cancel plans.\nMaybe you don't answer messages.\nMaybe you need the lights low.\nMaybe you don't want anyone touching you.\nMaybe you want someone nearby but don't want to talk.\nAnd then comes the guilt.\nWhy can't I just do it?\nOther people manage.\nI'm being lazy.\nBut maybe your body isn't asking for motivation.\nMaybe it's asking for recovery.\nBecause there are things that take energy that don't look like exercise.\nListening.\nTalking.\nMaking eye contact.\nWorking out what someone means.\nChanging plans.\nBeing around noise.\nManaging sensory discomfort.\nRemembering what you're supposed to do.\nTrying to look okay when you're not.\nGetting through a day can take a lot.\nAnd sometimes you don't notice the cost until you finally stop.\nSo if you reach the end of the day and your brain says,\n“Absolutely not.”\nMaybe listen.\nYou don't have to earn rest by becoming completely empty first."
    },
    {
      "note": "What does exhaustion look like for you?",
      "sub": "",
      "optionGroup": "looks",
      "options": [
        "I want to lie down",
        "I stop answering messages",
        "Talking feels difficult",
        "Decisions feel impossible",
        "I cancel plans",
        "I avoid people",
        "I stay in bed",
        "I scroll or watch familiar things",
        "Basic tasks feel huge",
        "I become more sensitive to noise or light",
        "I feel like I have nothing left",
        "I become more irritable"
      ]
    },
    {
      "note": "What does exhaustion feel like in your body?",
      "sub": "",
      "optionGroup": "body",
      "options": [
        "Heavy",
        "Weak",
        "Slow",
        "Foggy",
        "Tense",
        "Drained",
        "Sleepy",
        "Like my body won't cooperate",
        "Like everything takes effort",
        "I don't notice much physically",
        "I'm not sure yet"
      ]
    },
    {
      "note": "What tends to happen afterwards?",
      "sub": "",
      "optionGroup": "afterwards",
      "options": [
        "I sleep",
        "I need to be alone",
        "I need quiet",
        "I become less social",
        "I need familiar things",
        "I recover after resting",
        "I feel guilty for resting",
        "I feel better the next day",
        "It takes several days to recover",
        "I don't recover as quickly as I expect"
      ]
    },
    {
      "note": "You might be noticing a pattern",
      "sub": "You might be noticing a pattern\nYou chose that exhaustion can make ordinary things feel enormous.\nMaybe you've been calling yourself lazy when what you actually needed was rest.\nThere is a difference between:\n“I don't want to.”\nand\n“I don't have anything left.”\nSometimes your body knows the difference before you do.",
      "dynamicPattern": true
    }
  ],
  "Numbness": [
    {
      "note": "Numbness",
      "sub": "Someone asks:\n“How are you feeling?”\nYou pause.\nNothing.\nYou know you're supposed to have an answer.\nSad?\nAngry?\nFine?\nTired?\nYou search around inside yourself.\nNothing obvious.\nMaybe something happened earlier.\nSomething that normally would have upset you.\nBut you're not upset.\nOr at least...\nyou don't think you are.\nYou're just...\nblank.\nYou might still be doing everything you're supposed to do.\nGoing to work.\nAnswering messages.\nEating.\nWatching TV.\nHaving conversations.\nBut everything feels a little far away.\nYou might laugh at something because everyone else is laughing.\nYou might say you're fine because you don't know what else to say.\nMaybe you even think:\nWhy don't I care?\nAnd then you feel guilty for that too.\nSometimes numbness isn't the absence of feelings.\nSometimes it feels more like the feelings have gone somewhere you can't reach.\nYour body might be tired.\nYour brain might be overloaded.\nYou might have been holding things together for too long.\nAnd eventually your system says:\nNo more input.\nSo everything gets quieter.\nThat can feel scary.\nEspecially if you're used to analysing yourself.\nWhat am I supposed to be feeling?\nWhy can't I tell?\nWhat's wrong with me?\nMaybe nothing is wrong with you.\nMaybe your brain is giving you a break from having to process everything at once.\nYou don't have to force yourself to feel something.\nYou don't have to decide whether you're sad.\nYou don't have to find the perfect word.\nSometimes the most honest answer is:\n“I don't know what I feel right now.”\nThat's an answer too."
    },
    {
      "note": "What does numbness look like for you?",
      "sub": "",
      "optionGroup": "looks",
      "options": [
        "I can't tell what I'm feeling",
        "I say I'm fine because I don't know",
        "I stop caring about things temporarily",
        "I feel distant from people",
        "I do things automatically",
        "I struggle to react to things",
        "I feel emotionally blank",
        "I don't want to talk",
        "I find it hard to make decisions",
        "I feel like I'm watching myself from the outside",
        "I only realise what I felt later"
      ]
    },
    {
      "note": "What does numbness feel like in your body?",
      "sub": "",
      "optionGroup": "body",
      "options": [
        "Empty",
        "Heavy",
        "Flat",
        "Distant",
        "Foggy",
        "Quiet",
        "Disconnected",
        "Like I can't feel much",
        "Like I'm behind glass",
        "I don't notice anything physical",
        "I'm not sure yet"
      ]
    },
    {
      "note": "What tends to happen afterwards?",
      "sub": "",
      "optionGroup": "afterwards",
      "options": [
        "I suddenly feel everything later",
        "I cry",
        "I become exhausted",
        "I need to be alone",
        "I want familiar things",
        "I feel confused about what happened",
        "I start analysing everything",
        "I feel relieved",
        "I don't notice anything afterwards",
        "It takes time for feelings to come back"
      ]
    },
    {
      "note": "You might be noticing a pattern",
      "sub": "You might be noticing a pattern\nYou chose that sometimes the feeling doesn't disappear — you just can't reach it yet.\nMaybe you've spent years thinking:\n“I don't have emotions.”\nOr:\n“Why don't I react like everyone else?”\nMaybe your feelings are there.\nMaybe they just don't always arrive with words.\nYou don't have to find the feeling on command.\nSometimes you can wait for it to find you.",
      "dynamicPattern": true
    }
  ],
  "Overwhelm": [
    {
      "note": "Overwhelm",
      "sub": "It's just one thing.\nThen another.\nThen another.\nThe light is too bright.\nSomeone is talking.\nYour phone is buzzing.\nYou have three messages you haven't answered.\nSomeone wants to know what you're doing tomorrow.\nYou still haven't finished what you were doing today.\nAnd then someone says:\n“Can you just decide what you want for dinner?”\nAnd you think:\nI cannot.\nNot because dinner is difficult.\nBecause dinner is now the final question in a room full of questions.\nYou try to keep going.\nYou answer.\nYou smile.\nYou tell yourself you're fine.\nBut everything is getting louder.\nThe light.\nThe sound.\nYour thoughts.\nYour clothes.\nThe person talking.\nThe thing you're supposed to remember.\nThe thing you forgot.\nThe thing you might have forgotten.\nAnd suddenly you don't know which thing to deal with first.\nSo you deal with none of them.\nYou stare at the wall.\nYou scroll.\nYou cry.\nYou snap.\nYou pace.\nYou cover your ears.\nYou need everyone to stop.\nSometimes overwhelm looks dramatic.\nSometimes it looks like lying completely still.\nThat's the confusing part.\nPeople might think you're doing nothing.\nBut inside, there might be way too much happening.\nAnd sometimes it isn't one big thing.\nIt's twenty tiny things.\nA scratchy shirt.\nA loud room.\nA change in plans.\nA difficult conversation.\nA bad night's sleep.\nA decision you haven't made.\nA deadline.\nA message you don't know how to answer.\nEach one is manageable.\nUntil suddenly...\nthey aren't.\nYou might wonder why you can handle something one day and not the next.\nMaybe the thing didn't change.\nYour capacity did.\nAnd capacity changes.\nYou are not a machine.\nYou don't have the same amount of room every day.\nSometimes the kindest thing you can do is stop adding things to the pile."
    },
    {
      "note": "What does overwhelm look like for you?",
      "sub": "",
      "optionGroup": "looks",
      "options": [
        "I can't make decisions",
        "Everything feels urgent",
        "I want everyone to stop talking",
        "I become irritable",
        "I cry",
        "I go quiet",
        "I pace or move",
        "I cover my ears or eyes",
        "I need to leave",
        "I stop responding",
        "I can't work out what to do first",
        "I feel like I need to escape"
      ]
    },
    {
      "note": "What does overwhelm feel like in your body?",
      "sub": "",
      "optionGroup": "body",
      "options": [
        "Hot",
        "Tense",
        "Buzzing",
        "Heavy",
        "Tight chest",
        "Fast heartbeat",
        "Restless",
        "Like everything is too loud",
        "Like my skin is too sensitive",
        "Like I might explode",
        "Like I might shut down"
      ]
    },
    {
      "note": "What tends to happen afterwards?",
      "sub": "",
      "optionGroup": "afterwards",
      "options": [
        "I need complete quiet",
        "I sleep",
        "I shut down",
        "I cry",
        "I feel numb",
        "I need to be alone",
        "I need familiar things",
        "I feel exhausted",
        "I need hours or days to recover",
        "I don't want anyone to touch me",
        "I don't want to make any more decisions"
      ]
    },
    {
      "note": "You might be noticing a pattern",
      "sub": "You might be noticing a pattern\nYou chose that overwhelm can happen when lots of small things pile up.\nMaybe you've been asking yourself:\n“Why can't I handle this today?”\nYou might be noticing that the answer isn't always about the thing itself.\nSometimes it's about how much room you had left for it.\nYour capacity matters.",
      "dynamicPattern": true
    }
  ],
  "Shutdown": [
    {
      "note": "Shutdown",
      "sub": "Someone asks you a question.\nYou know the answer.\nIt's right there.\nYou just...\ncan't say it.\nYou try.\nNothing comes out.\nMaybe you nod.\nMaybe you shake your head.\nMaybe you stare at them.\nMaybe you walk away.\nAnd afterwards you think:\n“Why couldn't I just speak?”\nIt's not that you didn't want to answer.\nYou didn't suddenly forget how to talk.\nIt just felt like the words had become very far away.\nSometimes shutdown looks like becoming completely quiet.\nSometimes it's lying in bed with the curtains closed.\nSometimes it's staring at your phone without being able to respond.\nSometimes it's not being able to choose between two simple options.\nSometimes it's wanting someone to help you...\nbut not having enough energy to explain what kind of help you need.\nYour body can still be awake.\nYour brain can still be thinking.\nYou might even know exactly what you want to say.\nBut getting it from your head to the outside world feels impossible.\nAnd if someone keeps asking questions?\nSometimes it gets worse.\n“Are you okay?”\nYes.\nNo.\nMaybe.\nYou don't know.\nPlease stop asking.\nPlease don't leave.\nPlease just...\ngive me a minute.\nShutdown can happen when you've been dealing with too much for too long.\nSensory input.\nSocial demands.\nStress.\nChange.\nStrong emotions.\nHaving to keep going when you were already running low.\nIt doesn't mean you're ignoring someone.\nIt doesn't mean you don't care.\nIt doesn't mean you're being rude.\nSometimes your system has simply decided:\nWe are done talking for now.\nAnd maybe the most helpful thing isn't another question.\nMaybe it's less.\nLess noise.\nLess light.\nLess pressure.\nLess explaining.\nMore time."
    },
    {
      "note": "What does shutdown look like for you?",
      "sub": "",
      "optionGroup": "looks",
      "options": [
        "I stop talking",
        "I struggle to answer questions",
        "I can't find my words",
        "I communicate differently",
        "I stop replying to messages",
        "I stare or zone out",
        "I need to lie down",
        "I withdraw from people",
        "I can't make decisions",
        "I feel unable to do basic tasks",
        "I need people to stop asking questions",
        "I know what I want to say but can't say it"
      ]
    },
    {
      "note": "What does shutdown feel like in your body?",
      "sub": "",
      "optionGroup": "body",
      "options": [
        "Heavy",
        "Frozen",
        "Slow",
        "Drained",
        "Foggy",
        "Distant",
        "Tense",
        "Quiet",
        "Like my body won't respond",
        "Like I can't move or speak properly",
        "I don't notice much physically"
      ]
    },
    {
      "note": "What tends to happen afterwards?",
      "sub": "",
      "optionGroup": "afterwards",
      "options": [
        "I sleep",
        "I need complete quiet",
        "I need to be alone",
        "I slowly start talking again",
        "I feel exhausted",
        "I feel emotional",
        "I feel embarrassed",
        "I need familiar things",
        "I need several hours to recover",
        "I feel more like myself after resting"
      ]
    },
    {
      "note": "You might be noticing a pattern",
      "sub": "You might be noticing a pattern\nYou chose that sometimes you know what you want to say but can't get the words out.\nThat can feel frightening.\nEspecially if you've spent years thinking you should always be able to explain yourself.\nBut shutdown isn't you choosing not to communicate.\nSometimes your system is communicating something very clearly:\n“There is too much happening right now.”\nAnd the answer may not be more effort.\nIt may be less.",
      "dynamicPattern": true
    }
  ],
  "Disconnection": [
    {
      "note": "Disconnection",
      "sub": "You're sitting with people you know.\nThey're talking.\nYou hear them.\nYou understand the words.\nBut somehow...\nyou don't feel there.\nYou might laugh at the right moment.\nYou might answer when someone speaks to you.\nYou might even have a perfectly normal conversation.\nBut inside, everything feels slightly far away.\nLike you're watching yourself do it.\nOr like you're behind a sheet of glass.\nSometimes it happens when you're overwhelmed.\nSometimes when you're exhausted.\nSometimes after you've spent a long time being exactly who everyone else needs you to be.\nYou can be surrounded by people and still feel completely alone.\nAnd sometimes you can be alone and feel...\nnothing.\nYou might look at something you normally love and think:\nI know I like this.\nBut you don't feel the usual spark.\nYou might look at your own life and feel like you're standing a few steps away from it.\nEven your own body can feel strange.\nMaybe you don't notice you're hungry.\nOr tired.\nOr upset.\nOr tense.\nUntil suddenly you realise:\nOh.\nI've been ignoring myself for a while.\nSometimes disconnection is your brain's way of creating distance when everything feels like too much.\nSometimes it's what happens when you've been performing for too long.\nYou spend so much time thinking about how you're coming across...\nthat you stop noticing how you are actually doing.\nAnd then someone asks:\n“What do you want?”\nAnd you genuinely don't know.\nNot because you don't have preferences.\nYou just haven't checked in with yourself for a while.\nMaybe reconnecting doesn't need to be dramatic.\nMaybe it starts with something very small.\nAm I hungry?\nAm I comfortable?\nIs this light too bright?\nDo I actually want to be here?\nWhat would feel good right now?\nSometimes finding yourself again starts with something as simple as:\n“What do I need?”"
    },
    {
      "note": "What does disconnection look like for you?",
      "sub": "",
      "optionGroup": "looks",
      "options": [
        "I feel far away from myself",
        "I feel detached from people",
        "I go through routines automatically",
        "I don't know what I want",
        "I struggle to identify what I'm feeling",
        "Things I usually enjoy don't feel the same",
        "I feel like I'm watching myself",
        "I stop noticing my body",
        "I feel socially present but emotionally absent",
        "I feel like I'm behind glass",
        "I only notice what's wrong much later"
      ]
    },
    {
      "note": "What does disconnection feel like in your body?",
      "sub": "",
      "optionGroup": "body",
      "options": [
        "Numb",
        "Distant",
        "Heavy",
        "Empty",
        "Foggy",
        "Unreal",
        "Quiet",
        "Like I'm floating",
        "Like my body isn't quite mine",
        "I don't notice my body much",
        "I'm not sure yet"
      ]
    },
    {
      "note": "What tends to happen afterwards?",
      "sub": "",
      "optionGroup": "afterwards",
      "options": [
        "I suddenly realise how I was feeling",
        "I become emotional",
        "I need to be alone",
        "I sleep",
        "I want familiar things",
        "I start thinking about everything",
        "I feel more connected after resting",
        "I feel confused about what happened",
        "I need time to feel like myself again"
      ]
    },
    {
      "note": "You might be noticing a pattern",
      "sub": "You might be noticing a pattern\nYou chose that sometimes you don't notice what you need until much later.\nMaybe you've spent a lot of time looking outward.\nReading the room.\nWatching people.\nFiguring out what is expected.\nTrying to get things right.\nAnd somewhere along the way, you stopped checking:\n“How am I doing?”\nMaybe reconnecting with yourself doesn't have to happen all at once.\nYou can start small.\n“What do I need right now?”",
      "dynamicPattern": true
    }
  ],
  "Burnout": [
    {
      "note": "Burnout",
      "sub": "At first, you just think you're tired.\nYou'll catch up this weekend.\nThen the weekend comes.\nYou rest.\nAnd somehow...\nyou're still tired.\nSo you try harder.\nYou push yourself.\nYou make lists.\nYou get organised.\nYou tell yourself:\n“I just need to get back on track.”\nBut things that used to be easy start becoming difficult.\nAnswering messages.\nGoing to work.\nMaking food.\nGetting dressed.\nSeeing people.\nLeaving the house.\nMaking decisions.\nEven things you normally enjoy start feeling like work.\nAnd maybe you become angry with yourself.\nBecause you used to be able to do all of this.\nYou think:\nWhat happened to me?\nMaybe you've started cancelling things.\nMaybe you've stopped replying.\nMaybe you're sleeping more.\nMaybe you're more sensitive to sounds, lights, textures or people.\nMaybe things you could once tolerate suddenly feel impossible.\nMaybe your ability to “push through” has disappeared.\nAnd perhaps that's the part that scares you most.\nBecause pushing through used to be how you survived.\nYou learned how to keep going.\nYou learned how to mask.\nYou learned how to study the room.\nYou learned how to copy.\nYou learned how to be pleasant.\nYou learned how to keep conversations going.\nYou learned how to ignore your body's signals.\nYou learned how to say:\n“I'm fine.”\nEven when you weren't.\nAnd eventually...\nthere may come a point where your body stops accepting the deal.\nIt says:\nNo.\nNot today.\nNot tomorrow.\nMaybe not for a while.\nAutistic burnout is more than simply having a bad week.\nIt can involve a deeper loss of functioning and capacity after prolonged stress and demands, and recovery can take much longer than ordinary tiredness.\nAnd if you're late-diagnosed, there can be another strange layer to it.\nYou may suddenly look back and realise:\n“Oh.”\nMaybe you weren't lazy all those years.\nMaybe you weren't inconsistent.\nMaybe you weren't failing at being an adult.\nMaybe you were spending an enormous amount of energy trying to function in ways that didn't fit you.\nBurnout isn't a personal failure.\nIt isn't your body betraying you.\nIt may be your body telling you that the way you've been living isn't sustainable.\nRecovery isn't about becoming the old version of yourself as quickly as possible.\nSometimes it's about finding out what actually works for the version of you that exists now.\nLess pretending.\nMore honesty.\nMore recovery.\nMore support.\nMore things that make life feel possible.\nAnd maybe...\nless apologising for needing them."
    },
    {
      "note": "What does burnout look like for you?",
      "sub": "",
      "optionGroup": "looks",
      "options": [
        "Things I normally manage become difficult",
        "I stop replying to people",
        "I cancel plans more often",
        "Work or daily tasks feel impossible",
        "I need much more alone time",
        "I become more sensitive to sensory input",
        "I lose interest in things I usually enjoy",
        "I struggle with routines",
        "I need more recovery time",
        "I feel like I can't keep pushing",
        "I feel like I don't recognise myself",
        "I feel guilty for not being able to do more"
      ]
    },
    {
      "note": "What does burnout feel like in your body?",
      "sub": "",
      "optionGroup": "body",
      "options": [
        "Completely drained",
        "Heavy",
        "Foggy",
        "Exhausted even after sleeping",
        "Overstimulated",
        "Sensitive",
        "Tense",
        "Numb",
        "Like everything requires too much effort",
        "Like my body is saying “stop”",
        "I'm not sure yet"
      ]
    },
    {
      "note": "What tends to happen afterwards?",
      "sub": "",
      "optionGroup": "afterwards",
      "options": [
        "I need lots of rest",
        "I withdraw from people",
        "I need predictable routines",
        "I need familiar things",
        "I become more sensitive to sensory input",
        "I need much more time than usual to recover",
        "I feel guilty about needing rest",
        "I slowly rebuild my capacity",
        "I realise I can't return to doing everything the same way",
        "I start noticing what drains me",
        "I start noticing what actually helps me recover"
      ]
    },
    {
      "note": "You might be noticing a pattern",
      "sub": "You might be noticing a pattern\nYou chose that burnout isn't just “being tired.”\nIt can feel like your whole capacity has changed.\nMaybe the question isn't:\n“How do I get myself back to normal?”\nMaybe it's:\n“What was costing me so much in the first place?”\nBecause sometimes recovery isn't about learning how to push harder.\nSometimes it's about learning when you don't have to push at all.\nAnd if you're discovering this after years of wondering why life has always felt harder than it seemed to be for everyone else...\nmaybe this isn't the end of the story.\nMaybe it's the first time you're finally getting to write it differently.",
      "dynamicPattern": true
    }
  ],
  "Sadness": [
    {
      "note": "Sadness",
      "sub": "Sometimes it starts quietly.\nYou see something that reminds you of someone.\nA song comes on.\nSomeone says something that lands differently than they meant it to.\nYou have a difficult day.\nOr maybe nothing obvious happened at all.\nYou just wake up and think:\nI don't feel very good today.\nSadness doesn't always look like crying.\nSometimes you cry a lot.\nSometimes you don't cry at all.\nSometimes you want to curl up under a blanket.\nSometimes you want someone to hold you.\nSometimes you want absolutely nobody near you.\nMaybe you become very quiet.\nMaybe you watch the same show you've watched a hundred times because you don't have the energy for anything new.\nMaybe you listen to the same song over and over.\nMaybe you lie in bed and think about something that happened three years ago.\nMaybe you don't even know what you're sad about.\nThat's the strange thing about feelings.\nSometimes the body knows before the brain has worked out the story.\nYou might feel heavy.\nYour chest might ache.\nYour face might feel tired.\nEverything might seem a little grey.\nAnd if you're someone who has spent a lot of time trying to understand yourself, you might start investigating.\nWhy am I sad?\nWhat happened?\nWhat am I supposed to do about it?\nBut sadness doesn't always need to be solved.\nSometimes you just need somewhere safe to put it.\nMaybe that's crying.\nMaybe it's being quiet.\nMaybe it's writing.\nMaybe it's listening to music.\nMaybe it's sitting beside someone who doesn't need you to explain.\nAnd sometimes sadness comes with another feeling hiding underneath it.\nYou can be sad because you miss someone.\nSad because something changed.\nSad because you're lonely.\nSad because you're exhausted.\nSad because you finally realised something you've been avoiding.\nYou don't always have to choose just one.\nSometimes feelings are a little messy.\nThat's allowed."
    },
    {
      "note": "What does sadness look like for you?",
      "sub": "",
      "optionGroup": "looks",
      "options": [
        "I cry",
        "I become very quiet",
        "I want to be alone",
        "I want someone close",
        "I withdraw from people",
        "I stop replying to messages",
        "I stay in bed",
        "I listen to music",
        "I want familiar things",
        "I think about the past",
        "I don't always know why I'm sad"
      ]
    },
    {
      "note": "What does sadness feel like in your body?",
      "sub": "",
      "optionGroup": "body",
      "options": [
        "Heavy",
        "Tired",
        "Tight chest",
        "Aching",
        "Lump in my throat",
        "Tears",
        "Slow",
        "Empty",
        "Like I want to curl up",
        "I don't notice much physically",
        "I'm not sure yet"
      ]
    },
    {
      "note": "What tends to happen afterwards?",
      "sub": "",
      "optionGroup": "afterwards",
      "options": [
        "I feel lighter after crying",
        "I want to sleep",
        "I need to be alone",
        "I want comfort",
        "I feel exhausted",
        "I think about what happened",
        "I become numb",
        "I want familiar things",
        "I feel better after talking",
        "It takes a while to pass"
      ]
    },
    {
      "note": "You might be noticing a pattern",
      "sub": "You might be noticing a pattern\nYou chose that sadness sometimes makes you withdraw, seek comfort, or turn towards familiar things.\nMaybe you've been trying to work out exactly why you feel sad before allowing yourself to feel it.\nYou don't always need a perfect explanation.\nSometimes:\n“Something hurts today.”\nis enough.",
      "dynamicPattern": true
    }
  ],
  "Embarrassment": [
    {
      "note": "Embarrassment",
      "sub": "You said something.\nIt seemed completely normal in your head.\nThen you notice the other person's face.\nOh.\nMaybe that wasn't what they meant.\nMaybe you misunderstood the joke.\nMaybe you talked for much longer than everyone else.\nMaybe you shared something you thought was relevant and nobody responded.\nMaybe you waved back at someone who wasn't waving at you.\nMaybe you answered a question very literally.\nMaybe you realised, three hours later, that you completely misunderstood what happened.\nAnd suddenly your brain goes:\nOh no.\nYou replay it.\nThen again.\nThen again.\nAnd again.\nMaybe nobody else remembers.\nYou remember.\nYou can still feel the exact moment.\nYou might want to disappear.\nYou might laugh it off.\nYou might pretend you don't care.\nYou might go very quiet.\nYou might start wondering:\nDid they think I was weird?\nDid I say too much?\nDid I misunderstand?\nAre they going to remember this?\nAnd sometimes embarrassment can be especially confusing when you've spent years learning social rules by watching other people.\nYou might not always know what the rule was until you've broken it.\nWhich means sometimes you only discover the rule afterwards.\nThat can hurt.\nBecause you're not embarrassed simply because you made a mistake.\nYou're embarrassed because you're suddenly aware that other people noticed you making one.\nBut here's something worth remembering:\nBeing embarrassed doesn't mean you did something terrible.\nSometimes you were simply human in public.\nYou misunderstood.\nYou said too much.\nYou said too little.\nYou missed a cue.\nYou laughed at the wrong moment.\nIt happens.\nYour brain might replay it for another six months.\nThe other person may have forgotten before they got home."
    },
    {
      "note": "What does embarrassment look like for you?",
      "sub": "",
      "optionGroup": "looks",
      "options": [
        "I laugh it off",
        "I go quiet",
        "I want to leave",
        "I hide my face",
        "I change the subject",
        "I apologise quickly",
        "I replay what happened",
        "I worry about what people thought",
        "I avoid the person afterwards",
        "I pretend I don't care",
        "I only realise later that I was embarrassed"
      ]
    },
    {
      "note": "What does embarrassment feel like in your body?",
      "sub": "",
      "optionGroup": "body",
      "options": [
        "Hot face",
        "Flushed",
        "Tight chest",
        "Stomach dropping",
        "Sweaty",
        "Restless",
        "Like I want to disappear",
        "Heart beating faster",
        "Frozen",
        "I don't notice much physically",
        "I'm not sure yet"
      ]
    },
    {
      "note": "What tends to happen afterwards?",
      "sub": "",
      "optionGroup": "afterwards",
      "options": [
        "I replay it",
        "I feel embarrassed again",
        "I avoid the situation",
        "I tell someone I trust",
        "I laugh about it later",
        "I become self-conscious",
        "I feel ashamed",
        "I forget about it eventually",
        "I worry it will happen again",
        "I realise nobody else cared as much as I thought"
      ]
    },
    {
      "note": "You might be noticing a pattern",
      "sub": "You might be noticing a pattern\nYou chose that embarrassment can make you replay conversations and wonder what other people thought of you.\nMaybe your brain is trying to prevent the same thing happening again.\nSo it runs the scene.\nAgain.\nAnd again.\nBut remembering the moment doesn't mean you need to punish yourself for it.\nYou were learning.\nYou were navigating a social situation with the information you had.\nYou are allowed to get things wrong.",
      "dynamicPattern": true
    }
  ],
  "Shame": [
    {
      "note": "Shame",
      "sub": "Shame feels different.\nEmbarrassment can sound like:\n“Oh no. I did something awkward.”\nShame can sound like:\n“Oh no. There's something wrong with me.”\nMaybe you made a mistake.\nMaybe you couldn't do something other people seemed to find easy.\nMaybe you reacted more strongly than you wanted to.\nMaybe you had a meltdown.\nMaybe you needed help.\nMaybe you cancelled plans.\nMaybe you couldn't keep up.\nMaybe you masked for years and now you're looking back at things you did to survive.\nAnd instead of thinking:\nThat was difficult.\nyou think:\n“Why am I like this?”\nThat's shame.\nIt takes something that happened...\nand turns it into a story about who you are.\nYou might want to hide.\nYou might not want anyone to know how much you're struggling.\nYou might apologise even when you haven't done anything wrong.\nYou might push yourself far beyond your limits because needing help feels humiliating.\nYou might think everyone else has figured out how to be an adult except you.\nAnd sometimes shame grows quietly.\nSomeone makes a comment.\nA teacher tells you you're too sensitive.\nSomeone says you're overreacting.\nYou get called difficult.\nYou are told to make more effort.\nYou learn that certain parts of you are acceptable...\nand other parts need to be hidden.\nSo you hide them.\nAnd eventually you might not even know which parts are yours and which parts you've been taught to hide.\nIf you've been diagnosed later in life, you may sometimes look backwards and feel shame about things you understand differently now.\nMaybe you think:\nWhy didn't I just know?\nWhy couldn't I cope?\nWhy did I do that?\nBut you were doing the best you could with the information you had.\nA younger version of you doesn't need your judgement.\nThey need your understanding."
    },
    {
      "note": "What does shame look like for you?",
      "sub": "",
      "optionGroup": "looks",
      "options": [
        "I want to hide",
        "I avoid people",
        "I apologise a lot",
        "I criticise myself",
        "I don't want anyone to know I'm struggling",
        "I push myself too hard",
        "I compare myself to other people",
        "I feel like I've failed",
        "I replay things I've done wrong",
        "I feel like something is wrong with me",
        "I find it difficult to ask for help"
      ]
    },
    {
      "note": "What does shame feel like in your body?",
      "sub": "",
      "optionGroup": "body",
      "options": [
        "Heavy",
        "Hot",
        "Small",
        "Tight chest",
        "Dropping stomach",
        "Frozen",
        "Like I want to disappear",
        "Tense",
        "Numb",
        "I don't notice anything physical",
        "I'm not sure yet"
      ]
    },
    {
      "note": "What tends to happen afterwards?",
      "sub": "",
      "optionGroup": "afterwards",
      "options": [
        "I hide",
        "I withdraw",
        "I overthink",
        "I apologise",
        "I push myself harder",
        "I avoid asking for help",
        "I become self-critical",
        "I cry",
        "I feel numb",
        "I need someone I trust to reassure me",
        "The feeling stays for a long time"
      ]
    },
    {
      "note": "You might be noticing a pattern",
      "sub": "You might be noticing a pattern\nYou chose that shame often makes you turn against yourself.\nYou might notice that your first thought is:\n“What's wrong with me?”\nrather than:\n“What happened to me?”\nThat difference matters.\nBecause struggling doesn't automatically mean you're failing.\nNeeding support doesn't make you less capable.\nAnd a difficult moment doesn't tell the whole story of who you are.\nYou are not the worst thing you've ever thought about yourself.",
      "dynamicPattern": true
    }
  ],
  "Loneliness": [
    {
      "note": "Loneliness",
      "sub": "You can be alone and not feel lonely.\nYou can also be surrounded by people...\nand feel completely alone.\nMaybe you're sitting in a room full of people and thinking:\nNobody here really knows me.\nYou might have people you talk to.\nPeople you message.\nPeople you see.\nPeople who would probably say you're their friend.\nAnd still...\nsomething feels missing.\nMaybe you want someone who understands when you need silence.\nSomeone who doesn't take it personally when you disappear for a while.\nSomeone who wants to hear about the thing you're interested in.\nSomeone who doesn't make you explain every little difference.\nSomeone you can sit beside without performing.\nSometimes loneliness is wanting company.\nSometimes it's wanting understanding.\nAnd those aren't always the same thing.\nYou might also feel lonely because you don't know how to reach out.\nYou want someone to message you.\nBut you don't know what to say.\nYou want to be invited.\nBut you don't want to ask.\nYou want connection.\nBut the process of getting there feels exhausting.\nSo you stay home.\nAnd then you feel lonely for staying home.\nIt's a strange little loop.\nAnd sometimes you can feel lonely even when you're perfectly happy being alone.\nBecause being alone and being lonely are not opposites.\nYou can love your own company.\nYou can need solitude.\nAnd still want someone to say:\n“I get you.”\nMaybe what you're looking for isn't more people.\nMaybe you're looking for more places where you don't have to translate yourself."
    },
    {
      "note": "What does loneliness look like for you?",
      "sub": "",
      "optionGroup": "looks",
      "options": [
        "I want someone to talk to",
        "I want someone to understand me",
        "I want to be invited somewhere",
        "I want someone to check in on me",
        "I scroll through social media",
        "I think about people I miss",
        "I withdraw even though I want connection",
        "I struggle to reach out",
        "I feel lonely around other people",
        "I enjoy being alone but still feel lonely sometimes"
      ]
    },
    {
      "note": "What does loneliness feel like in your body?",
      "sub": "",
      "optionGroup": "body",
      "options": [
        "Heavy",
        "Empty",
        "Tight chest",
        "Ache",
        "Hollow",
        "Restless",
        "Sad",
        "Like I want to be held",
        "Like something is missing",
        "I don't notice anything physical",
        "I'm not sure yet"
      ]
    },
    {
      "note": "What tends to happen afterwards?",
      "sub": "",
      "optionGroup": "afterwards",
      "options": [
        "I reach out to someone",
        "I wait for someone to message me",
        "I withdraw further",
        "I watch something familiar",
        "I scroll",
        "I cry",
        "I want physical comfort",
        "I feel better after talking to someone",
        "I feel lonely even after socialising",
        "I need both connection and alone time"
      ]
    },
    {
      "note": "You might be noticing a pattern",
      "sub": "You might be noticing a pattern\nYou chose that loneliness isn't always about being alone.\nSometimes it's about wanting to feel known.\nMaybe you don't need more people in your life.\nMaybe you need more relationships where you can be quiet, strange, excited, direct, tired, passionate, or overwhelmed...\nwithout having to explain every part of yourself.\nConnection isn't about never needing space.\nSometimes it's knowing there's someone you can return to.",
      "dynamicPattern": true
    }
  ],
  "Uncertainty": [
    {
      "note": "Uncertainty",
      "sub": "Something is going to happen.\nYou don't know exactly what.\nAnd your brain does not enjoy this information.\nMaybe you're waiting for an answer.\nWaiting for plans to be confirmed.\nWaiting to hear whether something worked.\nWaiting to find out what happens next.\nPeople might say:\n“We'll see.”\nAnd you think:\nThat is not an answer.\nYou want the date.\nThe time.\nThe plan.\nThe details.\nThe exit.\nThe backup plan.\nYou might start searching.\nResearching.\nChecking.\nAsking.\nPlanning.\nRehearsing.\nTrying to turn a giant question mark into something you can hold.\nBecause uncertainty isn't just not knowing.\nSometimes it feels like not knowing means you can't prepare.\nAnd if you can't prepare...\nhow do you know what you'll need?\nHow do you know what to wear?\nWhat to say?\nWhere to go?\nWhen you'll leave?\nWhat will happen if something goes wrong?\nYour brain keeps asking questions because it's trying to find solid ground.\nSometimes there isn't any.\nAnd that's the uncomfortable bit.\nYou might spend hours trying to solve something that simply hasn't happened yet.\nMaybe you check your phone.\nAgain.\nNothing.\nYou check again.\nStill nothing.\nYou tell yourself to stop.\nThen check again.\nAnd sometimes uncertainty can sit beside excitement.\nA new job.\nA trip.\nA date.\nA new friendship.\nSomething wonderful might happen.\nBut you don't know yet.\nSo your body can't quite decide whether to prepare for danger or prepare for something good.\nThat's why uncertainty can feel so tiring.\nYou're waiting for information that hasn't arrived.\nAnd sometimes the kindest thing you can say to yourself is:\n“I don't know yet.”\nNot:\n“Something will go wrong.”\nNot:\n“I need to figure this out immediately.”\nJust:\n“I don't know yet.”"
    },
    {
      "note": "What does uncertainty look like for you?",
      "sub": "",
      "optionGroup": "looks",
      "options": [
        "I ask lots of questions",
        "I research",
        "I check things repeatedly",
        "I make backup plans",
        "I rehearse what might happen",
        "I ask for reassurance",
        "I struggle to make decisions",
        "I keep thinking about possible outcomes",
        "I find changes difficult",
        "I avoid situations I can't predict",
        "I keep checking my phone"
      ]
    },
    {
      "note": "What does uncertainty feel like in your body?",
      "sub": "",
      "optionGroup": "body",
      "options": [
        "Restless",
        "Tense",
        "Tight chest",
        "Knot in my stomach",
        "Buzzing",
        "Fast heartbeat",
        "Heavy",
        "Like I need to do something",
        "Like I can't settle",
        "I don't notice anything physical",
        "I'm not sure yet"
      ]
    },
    {
      "note": "What tends to happen afterwards?",
      "sub": "",
      "optionGroup": "afterwards",
      "options": [
        "I feel relieved when I finally know",
        "I feel exhausted",
        "I keep thinking about it",
        "I research more",
        "I ask someone I trust",
        "I avoid the situation",
        "I become overwhelmed",
        "I feel calm once there is a plan",
        "I realise I spent a lot of energy preparing",
        "I don't really know"
      ]
    },
    {
      "note": "You might be noticing a pattern",
      "sub": "You might be noticing a pattern\nYou chose that uncertainty often makes you search for information, make plans and try to work out what comes next.\nMaybe you've been told you worry too much.\nMaybe some of that worrying is actually your brain trying to create predictability.\nYou don't have to make every unknown certain.\nSometimes the new skill is learning to say:\n“I don't know yet, and I can wait.”",
      "dynamicPattern": true
    }
  ],
  "Confusion": [
    {
      "note": "Confusion",
      "sub": "Someone is explaining something.\nYou are listening.\nYou understand all the words.\nBut somehow...\nyou don't understand what they're actually asking you.\nSo you nod.\nYou say:\n“Yeah.”\nAnd then five minutes later you're thinking:\nWait. What?\nMaybe someone makes a joke and everyone laughs.\nYou don't.\nYou look around.\nYou try to work out what you missed.\nMaybe someone gives you instructions that seem obvious to them.\nYou follow them exactly.\nAnd then discover they meant something completely different.\nMaybe someone says:\n“It's fine.”\nAnd you're left wondering:\nIs it actually fine?\nAre they angry?\nWas that sarcastic?\nDo they want me to leave them alone?\nWhat am I supposed to do now?\nConfusion can be exhausting because sometimes you don't just need information.\nYou need context.\nYou need to know what someone means.\nWhat they expect.\nWhat the unspoken rule is.\nWhat you're supposed to do next.\nAnd sometimes everyone else seems to have received a little instruction manual that somehow never reached you.\nYou might ask lots of questions.\nOr you might stop asking because you've been made to feel like you're asking too many.\nSo you guess.\nAnd guessing can be stressful.\nEspecially when you really care about getting things right.\nSometimes confusion happens internally too.\nYou might know you're feeling something but not know what.\nAre you sad?\nAngry?\nOverwhelmed?\nEmbarrassed?\nTired?\nAll of them?\nMaybe you only understand what happened after you've had time alone.\nAnd that's okay.\nSome things need a little space before they make sense.\nYou don't have to understand everything immediately.\nSometimes the answer is simply:\n“I'm confused.”\nThat's not failure.\nThat's information."
    },
    {
      "note": "What does confusion look like for you?",
      "sub": "",
      "optionGroup": "looks",
      "options": [
        "I ask lots of questions",
        "I need things explained differently",
        "I ask people to repeat themselves",
        "I nod even when I don't understand",
        "I go quiet",
        "I overthink what someone meant",
        "I search for information afterwards",
        "I replay conversations",
        "I misunderstand jokes or hints",
        "I struggle with vague instructions",
        "I only understand what happened later"
      ]
    },
    {
      "note": "What does confusion feel like in your body?",
      "sub": "",
      "optionGroup": "body",
      "options": [
        "Foggy",
        "Tense",
        "Restless",
        "Heavy",
        "Like my brain is stuck",
        "Head feels full",
        "Overwhelmed",
        "Anxious",
        "Tired",
        "I don't notice anything physical",
        "I'm not sure yet"
      ]
    },
    {
      "note": "What tends to happen afterwards?",
      "sub": "",
      "optionGroup": "afterwards",
      "options": [
        "I ask someone I trust",
        "I research it",
        "I replay what happened",
        "I become anxious",
        "I feel embarrassed",
        "I avoid asking",
        "I understand later",
        "I become overwhelmed",
        "I need time alone",
        "I still don't know what happened"
      ]
    },
    {
      "note": "You might be noticing a pattern",
      "sub": "You might be noticing a pattern\nYou chose that confusion can make you replay conversations, search for answers and try to work out what people really meant.\nMaybe you've sometimes thought:\n“Why didn't I understand something so obvious?”\nMaybe it wasn't obvious.\nMaybe the information was missing.\nMaybe someone expected you to understand something they never actually said.\nYou are allowed to ask:\n“What do you mean?”\nUnderstanding isn't a race.",
      "dynamicPattern": true
    }
  ],
  "Insecurity": [
    {
      "note": "Insecurity",
      "sub": "You walk into a room.\nAnd suddenly you're aware of yourself.\nHow you're standing.\nWhat you're wearing.\nWhat your face is doing.\nWhere you're looking.\nWhether you're talking too much.\nWhether you're talking too little.\nYou start watching yourself from the outside.\nAm I being weird?\nDo I sound weird?\nDid I say that wrong?\nDo they like me?\nMaybe you know you're good at something...\nuntil you see someone else doing it better.\nMaybe you were confident about something...\nuntil someone criticised you.\nMaybe you know what you think...\nuntil you hear everyone else disagree.\nAnd suddenly you're not so sure anymore.\nInsecurity can make you question things you actually know.\nYou might ask someone:\n“Was that okay?”\nThey say yes.\nYou believe them for approximately four minutes.\nThen your brain starts again.\nSometimes insecurity comes from comparing yourself to other people.\nHow social they are.\nHow easily they communicate.\nHow much energy they have.\nHow quickly they understand things.\nHow effortlessly they seem to move through the world.\nAnd maybe you've spent years thinking:\n“Why can't I be more like that?”\nBut you don't see everything happening underneath their surface.\nAnd they don't see everything happening underneath yours.\nYou may also have learned to doubt yourself because you've been misunderstood before.\nYou know what happened.\nSomeone tells you it didn't.\nYou know what you meant.\nSomeone tells you that wasn't how it came across.\nYou know what you need.\nSomeone tells you you're being difficult.\nAfter enough of that...\nyou start checking yourself before you trust yourself.\nMaybe insecurity isn't always about not knowing yourself.\nSometimes it's about having learned that your own interpretation might be wrong.\nAnd rebuilding that trust takes time.\nYou don't have to suddenly become completely confident.\nMaybe it starts smaller.\n“I think I know what I need.”\n“I think my feelings make sense.”\n“I don't have to ask everyone else first.”"
    },
    {
      "note": "What does insecurity look like for you?",
      "sub": "",
      "optionGroup": "looks",
      "options": [
        "I compare myself to others",
        "I ask for reassurance",
        "I overthink what people think of me",
        "I apologise often",
        "I second-guess myself",
        "I change my behaviour to fit in",
        "I worry I've said the wrong thing",
        "I struggle to trust my decisions",
        "I look to other people for cues",
        "I feel confident until someone questions me",
        "I replay interactions afterwards"
      ]
    },
    {
      "note": "What does insecurity feel like in your body?",
      "sub": "",
      "optionGroup": "body",
      "options": [
        "Tight chest",
        "Nervous stomach",
        "Hot",
        "Restless",
        "Small",
        "Heavy",
        "Tense",
        "Shaky",
        "Like I want to hide",
        "I don't notice anything physical",
        "I'm not sure yet"
      ]
    },
    {
      "note": "What tends to happen afterwards?",
      "sub": "",
      "optionGroup": "afterwards",
      "options": [
        "I ask someone for reassurance",
        "I replay what happened",
        "I change what I was going to do",
        "I withdraw",
        "I avoid similar situations",
        "I become self-critical",
        "I feel embarrassed",
        "I feel ashamed",
        "I eventually realise I was being hard on myself",
        "I still don't trust my judgement"
      ]
    },
    {
      "note": "You might be noticing a pattern",
      "sub": "You might be noticing a pattern\nYou chose that insecurity often makes you look outside yourself for confirmation that you're okay.\nMaybe you've become very good at reading other people.\nMaybe sometimes you've become so good at it that you forget to read yourself.\nYou don't have to stop caring what other people think.\nYou can start by asking:\n“What do I think?”\nAnd letting your answer exist before anyone else's.",
      "dynamicPattern": true
    }
  ]
} satisfies Record<string, readonly EmotionizeStorySlide[]>;

export type EmotionizeStoryName = keyof typeof emotionizeStories;
