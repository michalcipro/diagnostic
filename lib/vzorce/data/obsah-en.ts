import type { VzorecId, VzorecObsah } from "../types"

// Anglické texty vyhodnocení jednotlivých vzorců.
//
// Angličtina tady dřív nebyla vůbec a obsah sahal po češtině, takže anglicky
// pozvaný klient dostal české vyhodnocení. Rodové značky {mužský|ženský} tu
// nejsou: angličtina rod oslovované osoby neprozradí.

export const OBSAH_EN: Record<VzorecId, VzorecObsah> = {
  "01": {
    nazev: "Abandonment",
    tema: "Fear of loss and emotional instability",
    motto: "Please don't leave me.",
    prozitek:
      "Somewhere inside you there is a certainty that you will lose the people you care about not by accident but as a matter of course. Either they will leave, or fall ill, or find someone else. Even when a relationship is going well, you are waiting for the moment it breaks. That certainty does not rest on what is actually happening, which is why it cannot be argued away by someone telling you they are not going anywhere. The abandonment pattern often forms before a child learns to speak, and that is why something old and urgent can be felt underneath it: a brief separation can set off a panic that is plainly too big for the situation. The reaction is usually one of two. Either you move closer, checking, verifying, asking for reassurance, and the more of it you get the shorter it lasts. Or you keep your distance instead, because what you do not let close cannot leave you. From the outside the two look different, but they do the same thing: they protect you from loss and at the same time stop the relationship growing strong enough to survive one. You recognise it by the mismatch: the force of the reaction does not match what has just happened. That mismatch is the most reliable trace that an old pattern is running, not today's situation.",
    podTlakem:
      "Under pressure your tolerance for uncertainty shortens. An unanswered message, a changed tone of voice or a few days without contact are read at once as the beginning of the end. You then make decisions not by what you want, but by what will keep the other person in place. It is easier to see afterwards than at the time: a decision made out of fear of loss is recognisable by the relief that lasts only briefly.",
    puvod:
      "Behind the pattern lies the experience that closeness is unreliable. It need not have been a dramatic loss. A parent who was warm one time and unavailable the next is enough, or illness in the family, repeated moves and lost friends, or an adult whose mood could not be predicted. What the child takes from it is not a thought but a bodily experience: what I love can be lost at any moment. And because it was learned before words, it cannot be rewritten by argument. Knowing where it comes from will not cancel the pattern. One thing does change, though: you stop treating it as a flaw of yours and start seeing it as an old reaction.",
    pasma: {
      "velmi-nizka":
        "This pattern barely registers with you. Losses affect you, but they do not define your relationships.",
      "nizka":
        "The pattern is present only at the margins. It shows up at tense moments and goes again.",
      "stredni":
        "The pattern is active and can be spotted under strain. In calm times you usually drown it out; under pressure it speaks up.",
      "vysoka":
        "The pattern strongly shapes how you experience relationships and what decisions you make inside them.",
      "dominantni":
        "The pattern is dominant. Fear of loss is largely what drives your behaviour in relationships. Without working on it, the other themes move only slightly.",
    },
  },
  "02": {
    nazev: "Mistrust",
    tema: "Vigilance, mistrust and the expectation of betrayal",
    motto: "I can't trust you.",
    prozitek:
      "The basic setting says that sooner or later people will use what they know about you. It need not be conscious suspicion. It is more a permanently switched-on vigilance that runs even where it is unnecessary. You track inconsistencies, check what people told you and look for what lies behind it. When someone does something kind, the first question is what they want in return. The paradox is that vigilance does not protect you but keeps you permanently tense, because you never have enough evidence. There are usually several protective strategies. You let nobody closer than the damage can reach. Or you hurt first so that nobody gets there before you. Or you keep perfect oversight, because whoever holds the information will not be caught out. It hurts most with the people closest to you. It is with them that betrayal would cost the most, and so it is with them that you watch hardest. Vigilance has one treacherous property: it always finds something. Anyone looking for evidence of betrayal will sooner or later find it even in an ordinary inaccuracy.",
    podTlakem:
      "Under pressure vigilance turns into defence. You read disagreement as an attack, a question as an interrogation, feedback as an attempt to bring you down. The reaction comes fast and tends to be harder than the situation deserves, including towards people who have done nothing to you. The price is paid in relationships, not in the conflict. People gradually stop bringing you bad news, and with that goes exactly what you would need to know.",
    puvod:
      "The pattern grows where basic safety was missing. Sometimes it is abuse, humiliation or exploitation; sometimes a milder but repeated experience: an adult who promised and did not keep it, who made a joke of a secret entrusted to them, who behaved unpredictably. The child draws a reasonable conclusion: it is safe only when I am on guard. In childhood that was the right strategy. In adulthood it blocks exactly what you need most. The pattern holds because it seems verified. Every trust that is disappointed confirms it; every trust that holds is explained away as an exception or as not yet.",
    pasma: {
      "velmi-nizka":
        "The pattern is practically inactive. You extend trust according to what has actually happened.",
      "nizka":
        "It shows up at the margins, more as caution than as mistrust.",
      "stredni":
        "The pattern is active. In a safe environment it recedes; under strain the vigilance returns.",
      "vysoka":
        "The pattern strongly shapes how close you let people and how you read their intentions.",
      "dominantni":
        "The pattern is dominant. Vigilance is the default mode, not the exception. Change starts with one relationship, not with an attitude towards people in general.",
    },
  },
  "03": {
    nazev: "Emotional deprivation",
    tema: "Emotional hunger and an unmet need for closeness",
    motto: "I'll never have the love I long for.",
    prozitek:
      "This pattern is hard to describe, because it does not have the shape of a thought. It is more a lasting sense of emptiness and loneliness that does not lift even among people who care about you. Nobody quite understands you. Nobody really asks how you are. Nobody is here in the way you would need. Often it shows up first in the relationships you choose: you are drawn to people who cannot reach emotionally as far as you need, and so the emptiness is confirmed. Or a relationship starts promisingly and in time brings disappointment and boredom, because the other person never gives enough. From the outside it looks like being demanding. From the inside it is hunger. The hardest part is usually that you cannot ask for closeness. Either because you do not think it possible, or because accepting care means exposing yourself. It is not that you are demanding. It is that you cannot put in a claim for closeness, and a need that is never spoken cannot be met.",
    podTlakem:
      "Under pressure you withdraw. Instead of leaning on the people around you, you stop sharing and carry it alone, because somewhere inside you are certain nobody will come anyway. That confirms the emptiness and the pattern grows stronger. The other person usually has no idea. From the outside you look self-sufficient, so there is no reason for them even to ask.",
    puvod:
      "Something was missing that a child needs as much as food: attention, warmth, understanding and sensitive guidance. It need not have been neglect. Parents could be careful about what shows and unavailable in what is felt. They were busy, cold, emotionally empty themselves, or simply unable to be with a child's feelings. The child does not turn this into a complaint, because it has no other experience. It turns it into a norm: this is simply how it is. That is precisely why the feeling is so hard to describe. There is no memory of something bad, only a missing memory of something that never happened.",
    pasma: {
      "velmi-nizka":
        "The pattern is practically inactive. You can both receive closeness and give it.",
      "nizka":
        "It shows up only at the margins, in periods when you are poorer in contact.",
      "stredni":
        "The pattern is active. The sense of not being understood returns and colours how you judge relationships.",
      "vysoka":
        "The pattern strongly shapes your relationships and who you choose.",
      "dominantni":
        "The pattern is dominant. Emotional hunger is the underlying note the other themes rest on. The first step is not more closeness, but being able to ask for it.",
    },
  },
  "04": {
    nazev: "Social exclusion",
    tema: "A sense of difference and of being outside the group",
    motto: "I don't belong anywhere.",
    prozitek:
      "The basic feeling is loneliness in company, not loneliness alone. In a group you stand outside, even when nobody is excluding you. There are two forms and they can overlap. The first says: they do not want me. In company you feel inadequate, you do not know what to talk about, the others seem more capable, cleverer or better looking, and you sit the whole occasion out, relieved when you can finally leave. The second says: I am different. It need carry no sense of inferiority, more a permanent awareness that you do not belong to this group because you are made of other stuff. What matters is that this pattern concerns groups, not close relationships. With individuals you know you may be perfectly comfortable. As soon as there are more people and they are not familiar, it fires again. The good news is that this pattern has a narrow reach. When a group breaks up into individual conversations, it usually disappears with it.",
    podTlakem:
      "Under pressure you avoid. You do not accept the invitation, do not speak up in the meeting, do not ask for the floor, do not push your idea in the group. Every avoidance brings short-term relief and confirms the pattern in the long run, because the experience that would disprove it never gets a chance to happen. Avoidance always has a reasonable explanation: tiredness, time, another priority. That is exactly why it holds so well and why you notice it so badly.",
    puvod:
      "Unlike emotional deprivation, this pattern usually does not form at home but among peers. It was exclusion from a group, mockery, a family that stood out in some conspicuous way, a move to a place where you did not fit, or simply a long period when you were the last one picked. Sometimes a single strong enough period is enough. The child draws a rule about itself, not about that group. A child's conclusion has one property: it is never re-examined. The group that did not accept you back then is long gone; the rule about yourself still stands.",
    pasma: {
      "velmi-nizka":
        "The pattern is practically inactive. You move through groups naturally.",
      "nizka":
        "It shows up at the margins, in new or very formal settings.",
      "stredni":
        "The pattern is active. In groups you stand more to one side than you would like.",
      "vysoka":
        "The pattern strongly shapes where you go, what you allow yourself to say and how large a group you can bear.",
      "dominantni":
        "The pattern is dominant. The feeling of not belonging is constant and drives your choices. Change will not come from a decision but from repeated experience inside a group.",
    },
  },
  "05": {
    nazev: "Dependence",
    tema: "Uncertainty about independence and decision-making",
    motto: "I can't manage on my own.",
    prozitek:
      "Ordinary life feels like something you do not have the strength for. This is not laziness and not real incapacity; you often manage far more than you admit. It is the feeling that without someone else you will not hold up. A new situation raises anxiety, decisions get put off until somebody advises you, and even after deciding the doubt remains that it was a mistake. You do not trust your own judgement, so you keep having it confirmed. There is also a reversed form that looks like the exact opposite: an independence so principled that you will not accept help even when you genuinely need it. That is not strength; it is the same pattern from the other side. Accepting help would mean admitting that you are not enough on your own, and that is unbearable. Both forms rest on the same sentence: I cannot do this alone. The treacherous part is that decisions someone confirms for you add no certainty. Only the ones you make and stand behind yourself do.",
    podTlakem:
      "Under pressure decision-making stops. You look for someone to decide for you, or you avoid the decision long enough for time to make it. Responsibility moves elsewhere, and with it the sense that you have any influence over your own life. It is not the big decisions that matter here. Certainty is built on the small ones, of which there are many, not on the one big one that comes round once a year.",
    puvod:
      "The pattern usually grows not from a lack of care but from an excess of it. A parent who did things for you faster and better, who shielded you from mistakes, who showed anxiety whenever you tried something on your own. The child concludes that the world is more dangerous, and itself less capable, than is true. Sometimes the opposite works too: an environment so unpredictable that independence could not be tried out safely. That is why this pattern so often carries guilt. The parent meant well and the child knows it; it is hard to be angry at good intentions.",
    pasma: {
      "velmi-nizka":
        "The pattern is practically inactive. You make decisions yourself and stand behind them.",
      "nizka":
        "It shows up at the margins, with big or unfamiliar decisions.",
      "stredni":
        "The pattern is active. Without confirmation from outside, deciding becomes markedly harder.",
      "vysoka":
        "The pattern strongly shapes your independence and how far you steer your own life.",
      "dominantni":
        "The pattern is dominant. The question of whether you can manage alone sits under most decisions. Every decision you make on your own takes a piece of the pattern's strength away.",
    },
  },
  "06": {
    nazev: "Vulnerability",
    tema: "Catastrophising and the expectation of threat",
    motto: "Disaster is about to strike.",
    prozitek:
      "You expect something bad to happen, and at the same time that you will be unable to prevent it. The pattern works in two directions at once: it magnifies the danger and shrinks your capacity to face it. That is why calculating how unlikely something is does not help. Threat tends to fall into four usual areas, and you need not have them all. Health and illness, where you monitor bodily signs and look for what they mean. Danger from outside: accidents, assault, flying, travel. Money, meaning the fear of losing everything. And loss of control, meaning the fear that you will not hold yourself together in front of people, will break down or go mad. The hardest part is usually that anxiety does not decrease because nothing happens. Every day without disaster is only a day when it has not come yet. Anxiety does not confuse probability with possibility by accident. As long as something is possible, the body counts it as a threat, even when it is unlikely.",
    podTlakem:
      "Under pressure your options narrow. You decide so as to minimise risk, not to achieve anything. Opportunities are refused before there is time to weigh them, and attention stays on what could go wrong. Avoidance works as a relief that deepens the problem. Every situation left untried stays dangerous, because it never got the chance to be disproved.",
    puvod:
      "Behind the pattern there is usually an adult who presented the world as a dangerous place. An overprotective parent who warned against everything, lived in anxiety themselves and made clear that calamity was waiting outside. Or, conversely, real threat in childhood: serious illness in the family, an accident, poverty, an unstable home. The child takes two convictions from it at once: that the world is dangerous and that it is not equal to it. A child does not remember the warnings; it remembers the tone. That is exactly why numbers and statistics do not help: it was stored somewhere other than reason.",
    pasma: {
      "velmi-nizka":
        "The pattern is practically inactive. You see risk factually and in proportion.",
      "nizka":
        "It shows up at the margins, in periods of tiredness or genuine uncertainty.",
      "stredni":
        "The pattern is active. Catastrophic scenarios return and take energy.",
      "vysoka":
        "The pattern strongly shapes what you go into and what you would rather avoid.",
      "dominantni":
        "The pattern is dominant. Expecting threat is the permanent background you decide against. It shrinks by being tested, not by being explained.",
    },
  },
  "07": {
    nazev: "Defectiveness",
    tema: "Shame, inner inadequacy and the fear of being found out",
    motto: "Anyone who gets to know me can't care for me.",
    prozitek:
      "The main feeling is shame. Not guilt for what you did, but shame for what you are. Somewhere inside you hold the conviction that there is something faulty in you, and that if people saw it they would leave. So it gets hidden. Parts of yourself are not shown even to those closest to you, least of all to them. A gap opens between the person people know and the person you think you really are. Unlike social exclusion, which concerns groups, this pattern grows stronger precisely with closeness. The closer you let someone, the greater the risk of being found out. Two kinds of behaviour follow, and they often alternate. Either you avoid closeness, or you choose people who criticise and reject you, because they fit the picture you hold of yourself. Praise, meanwhile, does not stick; it slides off the surface. Criticism lands exactly. The difference from healthy self-criticism lies in where it stops: self-criticism ends at the mistake, shame carries on to a conclusion about who you are.",
    podTlakem:
      "Under pressure shame turns into self-criticism harder than anything another person would say to you. You cannot get the mistake off your back. Either you withdraw so there is nothing to find out, or you get ahead of the criticism by putting yourself down first. The hardest part is that relief comes from exactly what feeds the pattern: hiding. Every act of hiding confirms that there was something to hide.",
    puvod:
      "The pattern is built by repeated criticism from someone who mattered. A parent who compared, humiliated, showed disappointment or made love conditional. It need not have been harshness; coldness and constant dissatisfaction are enough. A child has no way of concluding that the problem lies in the adult. It arrives at the only available explanation: it is me. That is why this pattern cannot be overridden by success. Performance proves what you can do; shame speaks about what you are, and the two pass each other by.",
    pasma: {
      "velmi-nizka":
        "The pattern is practically inactive. Your imperfections can bear being seen.",
      "nizka":
        "It shows up at the margins, after a setback or criticism.",
      "stredni":
        "The pattern is active. Shame returns and shapes how much of yourself you show.",
      "vysoka":
        "The pattern strongly shapes your relationship with yourself and how close you let people.",
      "dominantni":
        "The pattern is dominant. Shame is the base layer everything else is seen through. It gives way only where someone sees you and does not leave.",
    },
  },
  "08": {
    nazev: "Failure",
    tema: "Expecting failure and distrusting your own performance",
    motto: "I'm not good enough to succeed.",
    prozitek:
      "In the area of performance and achievement you compare yourself with others and come out below average. It is not that you are afraid of demanding tasks. It is the certainty that compared with your peers you have fallen behind, even when the facts say otherwise. Two forms follow from this. The first is withdrawal: you do not go into things you would probably manage, because the expected failure cannot be borne. The second is impostor syndrome: you have the success, but you do not count it as yours and you wait for people to find out that you are not really that capable. The pattern works as a self-fulfilling prophecy. Because you do not go all in, or do not go in at all, the results match, and that is then read as confirmation. The distinction from perfectionism matters: failure means expecting too little of yourself compared with others; perfectionism means expecting too much compared with an unreachable mark. Watch who you compare yourself with. The pattern picks the yardstick so that the answer comes out: someone else's best day against your worst.",
    podTlakem:
      "Under pressure comes delay or escape. The task is put off, the goal is lowered, the opportunity is let go. Sometimes the opposite comes instead, excessive work but without any joy in the result, because no result is enough to convince. The dangerous part is that delay presents itself as reasonable. There is always a reason why right now is not the moment, and that reason is usually true.",
    puvod:
      "Behind it there is usually an environment where performance was compared and the comparison came out badly. A sibling held up as the example, a school you could not keep up with, a parent who showed disappointment or, conversely, did not help where you needed it. Sometimes the cause is an unrecognised learning difficulty, or a field chosen to please parents rather than to fit ability. The child reaches a conclusion about its capacities before it has any chance to test them. That conclusion about your own capacities was reached at a time when you had almost no data. Ever since, it has only been confirmed.",
    pasma: {
      "velmi-nizka":
        "The pattern is practically inactive. You trust your abilities in proportion.",
      "nizka":
        "It shows up at the margins, after a setback or in a new field.",
      "stredni":
        "The pattern is active. Comparing yourself with others takes away certainty and appetite for risk.",
      "vysoka":
        "The pattern strongly shapes what goals you allow yourself and how you read your own results.",
      "dominantni":
        "The pattern is dominant. The expectation of failure precedes most decisions about performance. It gives way only after an experience that cannot be explained away as chance.",
    },
  },
  "09": {
    nazev: "Subjugation",
    tema: "Compliance, self-suppression and lost boundaries",
    motto: "In the end I always do what you want.",
    prozitek:
      "You live by what other people want, and you set your own needs aside so naturally that you often do not even notice. You avoid conflict, you give way as long as you can, and when you do occasionally put yourself first, guilt follows. A quiet imbalance grows out of it: you give more than you receive, and the main decisions in your life seem to be made by someone else. There are two variants. Compliance, where you adapt out of fear of anger, retaliation or loss. And self-sacrifice, where you adapt because you feel other people's pain so strongly that there is no other way. From the outside it looks like kindness, and often it is kindness. The difference is that here you are not choosing it. Meanwhile anger builds up underneath with nowhere to discharge, and so it comes out indirectly: as passivity, procrastination, tiredness, physical complaints or an unexpected outburst. You recognise it by tiredness that makes no sense. When an ordinary week leaves you with nothing left, it is usually not the work behind it but the giving way.",
    podTlakem:
      "Under pressure you say yes before you have had time to count your capacity. Your own boundary goes first, and admitting that you cannot do it any more comes last. Exhaustion then does not come from the work, but from the fact that nowhere in it are you counted. The first boundary to fall is the one towards yourself. Only then do the others fall, and the people around you notice it long before you do.",
    puvod:
      "Behind the pattern stands an adult whose will could not safely be refused. A parent who was dominant, unpredictable, punishing, or, conversely, fragile and ill and not to be burdened. In both cases the child learned that having a need of its own is dangerous or selfish. Its own wanting was therefore muted before it could be spoken. That is why your own need so often appears not as a need but as selfishness. The child learned that wanting is dangerous, not that it is normal.",
    pasma: {
      "velmi-nizka":
        "The pattern is practically inactive. You can name your needs and stand up for them.",
      "nizka":
        "It shows up at the margins, towards authority or in close relationships.",
      "stredni":
        "The pattern is active. Boundaries hold worse than you would like, especially in conflict.",
      "vysoka":
        "The pattern strongly shapes how much room you have in your own life.",
      "dominantni":
        "The pattern is dominant. Adapting is the default mode and your own wanting barely speaks. The first step is not conflict, but a need spoken out loud inside a safe relationship.",
    },
  },
  "10": {
    nazev: "Unrelenting standards",
    tema: "Relentless demands, pressure and a performance identity",
    motto: "I'll never be good enough.",
    prozitek:
      "The basic feeling is pressure and a shortage of time. Something keeps driving you forward, so there is nowhere to stop, and even rest turns into a task to be done well. You have to be the best at everything that matters to you; second place does not count. From the outside it looks like success, from the inside like never-ending inadequacy, because the bar moves along with you. Three forms are distinguished and they can overlap. The compulsive form, where everything has to be in perfect order and the smallest thing can throw you. The achievement-focused form, meaning workaholism, where everything including hobbies turns into work. And the status-focused form, which is about recognition, prestige and admiration, and which tends to compensate for inferiority or social exclusion. It is usually your relationship and your health that pay first, because both can be postponed and neither says anything straight away. The simplest check is this: when did you last feel it was enough? If you cannot remember, the bar is moving along with you.",
    podTlakem:
      "Under pressure you do not slow down, you speed up. You take on another responsibility, as though this next thing would finally bring relief. A mistake is punished not by correction but by self-criticism, and rest is the first thing pushed aside. Adding work is a relief, not a solution. As long as something is being done, there is no time to feel that it is not enough.",
    puvod:
      "The pattern is built by conditional love. Approval came for performance, not for being. One or both parents had demands that could not be met, were perfectionists themselves, held themselves up as the example, or reacted harshly when you did not meet their expectations. For the child, achieving became the way to secure love and safety. That is why the pattern is still wired to the instinct for self-preservation, and why it resists reasonable arguments so stubbornly. That is why an agreement with yourself does not work on this pattern. For the body, slowing down means risking love, and reason will not rewrite that.",
    pasma: {
      "velmi-nizka":
        "The pattern is practically inactive. Your standards for yourself are high but bearable.",
      "nizka":
        "It shows up at the margins, in periods of high performance pressure.",
      "stredni":
        "The pattern is active. The bar is high and rest is postponed more often than is healthy.",
      "vysoka":
        "The pattern strongly shapes your pace, your relationships and how much rest you allow yourself.",
      "dominantni":
        "The pattern is dominant. Performance is your identity and stopping feels like a threat. Here slowing down is trained as a skill, not adopted as a resolution.",
    },
  },
  "11": {
    nazev: "Entitlement / grandiosity",
    tema: "Entitlement, impulse and trouble with the limit",
    motto: "I can do and have what I want.",
    prozitek:
      "You feel that the usual limits do not quite apply to you, and that your needs come first. When someone contradicts you or thwarts you, anger comes that is out of proportion to the situation. The pattern has three forms and they can overlap. Spoiltness, where you claim an exception and do not put yourself in other people's shoes, because it simply does not occur to you. The dependent form, where entitlement pairs with the expectation that someone stronger will take care of you, because that is their duty. And the impulsive form, where the problem is bearing discomfort: pleasure is hard to postpone, a goal that has stopped being fun is hard to finish, and whatever brings short-term relief is hard to stop. From the outside this pattern looks self-assured. Inside there is usually something quite different beneath it, most often shame or emptiness that entitlement drowns out. The most reliable trace is anger at something small. A disproportionate reaction to a minor restriction shows from the outside before it shows from within.",
    podTlakem:
      "Under pressure your tolerance for restriction drops. Rules, waiting and compromise become unbearable, decisions are made fast and impulsively, and consequences are dealt with afterwards. It is usually relationships that pay before results do. And the consequences are borne by the people around you before they are borne by you. That is precisely why the pattern holds so long: its price is paid elsewhere.",
    puvod:
      "Behind the pattern lies either an absence of boundaries, where the child got everything and nobody said no, or the opposite, compensation: an environment where the child was humiliated or overlooked, and being exceptional became the way to survive it. Sometimes there is also a parent who displayed the child as proof of their own worth. In all variants what was missing was the experience that a boundary can be kind and firm at once. Both routes lead to the same place: a boundary was never a safe experience. Either it was missing altogether, or it arrived as humiliation.",
    pasma: {
      "velmi-nizka":
        "The pattern is practically inactive. You carry limits and rules without difficulty.",
      "nizka":
        "It shows up at the margins, in moments of tiredness or frustration.",
      "stredni":
        "The pattern is active. Restriction and waiting go harder than they need to.",
      "vysoka":
        "The pattern strongly shapes your reactions to obstacles and lands on the people around you.",
      "dominantni":
        "The pattern is dominant. Entitlement and impulse get ahead of judgement in most situations. Change starts with noticing the price the people around you pay.",
    },
  },
}
