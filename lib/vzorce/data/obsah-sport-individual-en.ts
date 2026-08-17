import type { VzorecId, VzorecObsah } from "../types"

// Anglické texty vyhodnocení vzorců pro individuální sport.
//
// Anglická verze. Rodové značky {mužský|ženský} tu nejsou: angličtina rod
// oslovované osoby neprozradí. Závazné názvy jsou v docs/slovnik-prekladu.md.

export const OBSAH_SPORT_INDIVIDUAL_EN: Record<VzorecId, VzorecObsah> = {
  "01": {
    nazev: "Abandonment",
    tema: "Loss of backing and of certainty about your place",
    motto: "Once I stop performing, I'll be left on my own.",
    prozitek:
      "Somewhere inside you there is a certainty that you will lose the people who hold you up in your sport not by accident but as a matter of course. The coach will move on, the training group will break up, the federation will change its plans, the interest will fade. Even in a spell when things are going well, you are waiting for the moment it breaks. That certainty does not rest on what is actually happening, which is why neither a new contract nor a secure selection can argue it away. It often forms before you can remember, and that is why something old and urgent can be felt underneath it: a few days without your coach's attention can set off a panic that is plainly too big for the situation. The reaction is usually one of two. Either you move closer, verifying, asking, wanting reassurance, and the more of it you get the shorter it lasts. Or you keep your distance instead, because what you do not let close cannot leave you. From the outside the two look different, but they do the same thing: they protect you from loss and at the same time stop the relationship with your coach or your backing growing strong enough to survive one. You recognise it by the mismatch: the force of the reaction does not match what has just happened.",
    podTlakem:
      "Under pressure your tolerance for uncertainty shortens. An unanswered phone call, a changed tone in training or a few days without feedback are read at once as the beginning of the end. You then make decisions not by what is good for your career, but by what will keep the other person in place: you accept terms that do not suit you, or you stay quiet where you ought to speak. In the decisive phase of a race it comes out as caution, because in this logic a mistake is not punished by the loss of a point but by the loss of favour.",
    puvod:
      "Behind the pattern lies the experience that closeness is unreliable. It need not have been a dramatic loss. A parent who was warm one time and unavailable the next is enough, or illness in the family, repeated moves and lost friends, or a childhood coach whose mood could not be predicted. What the child takes from it is not a thought but a bodily experience: what I love can be lost at any moment. And because it was learned before words, it cannot be rewritten by argument. Knowing where it comes from will not cancel the pattern; one thing does change, though, in that you stop treating it as a flaw of your own.",
    pasma: {
      "velmi-nizka":
        "This pattern barely registers with you. Changes in your backing affect you, but they do not define how you go about your sport.",
      "nizka":
        "The pattern is present only at the margins. It shows up when a bigger change comes and goes again.",
      "stredni":
        "The pattern is active and can be spotted under strain. In calm times you drown it out; as the end of the season nears or when the coach changes, it speaks up.",
      "vysoka":
        "The pattern strongly shapes how you experience the relationships around your sport and what decisions you make about your career.",
      "dominantni":
        "The pattern is dominant. Fear of losing your backing is largely what drives the decisions you make in your sport. Without working on it, the other themes move only slightly.",
    },
  },
  "02": {
    nazev: "Mistrust",
    tema: "Expecting betrayal and guarding your own position",
    motto: "I can't fully trust anyone here.",
    prozitek:
      "The basic setting says that the people around you will sooner or later use what they know about you. It need not be conscious suspicion. It is more a permanently switched-on vigilance that runs even where it is unnecessary: you track who the coach favours, check what people told you and look for what lies behind it. When someone praises you, the first question is what they want in return. Sport feeds this pattern naturally, because the competition is real and selection and backing are genuinely fought over. The difference lies in the degree: vigilance does not protect you but keeps you permanently tense, because you never have enough evidence. There are usually several protective strategies. You let nobody closer than the damage can reach. Or you show hardness first so that nobody gets there before you. Or you keep perfect oversight, because whoever holds the information will not be caught out. It hurts most with the people closest to you, because it is with them that betrayal would cost the most.",
    podTlakem:
      "Under pressure vigilance turns into defence. You read your coach's disagreement as an attack, a technical note as being called into question, a debrief as an attempt to bring you down. The reaction comes fast and tends to be harder than the situation deserves, including towards people who have done nothing to you. The price, though, is not paid in the conflict but in the relationships: the people around you gradually stop bringing you uncomfortable information, and with that goes exactly what you would need in order to improve.",
    puvod:
      "The pattern grows where basic safety was missing. Sometimes it is abuse, humiliation or exploitation; sometimes a milder but repeated experience: an adult who promised and did not keep it, who made a joke of a secret entrusted to them, a coach who put down in front of the others something you had confided. The child draws a reasonable conclusion: it is safe only when I am on guard. In childhood that was the right strategy. In adult sport it blocks exactly what you need most, which is a relationship in which mistakes can be worked on out loud.",
    pasma: {
      "velmi-nizka":
        "The pattern is practically inactive. You extend trust according to what has actually happened.",
      "nizka":
        "It shows up at the margins, more as caution than as mistrust.",
      "stredni":
        "The pattern is active. In a safe environment it recedes; when your position is being fought over, the vigilance returns.",
      "vysoka":
        "The pattern strongly shapes how close you let your coach and the people in your support team.",
      "dominantni":
        "The pattern is dominant. Vigilance is the default mode, not the exception. Change starts with one relationship, not with an attitude towards everyone around you.",
    },
  },
  "03": {
    nazev: "Emotional deprivation",
    tema: "Emotional hunger and the sense that nobody sees what a performance costs",
    motto: "Nobody knows what this costs me.",
    prozitek:
      "This pattern is hard to describe, because it does not have the shape of a thought. It is more a lasting sense of emptiness and loneliness that does not lift even in the middle of a setup that works. What interests them is the result, not you. Nobody asks how you really felt after the race. Nobody is here in the way you would need. In sport this is easy to hide, because the environment rewards self-reliance and quiet graft; the people around you often have no idea that anything is missing. Often it shows up first in who you choose: you are drawn to people who cannot reach emotionally as far as you need, and so the emptiness is confirmed. Or a relationship, including the one with your coach, starts promisingly and in time brings disappointment, because the other person never gives enough. From the outside it looks like being demanding. From the inside it is hunger. The hardest part is usually that you cannot ask for closeness: either because you do not think it possible, or because accepting care means exposing yourself.",
    podTlakem:
      "Under pressure you withdraw. Instead of leaning on the people around you, you stop sharing and carry it alone, because somewhere inside you are certain nobody will come anyway. After an injury or in a spell without form it shows most: you stay silent where a single sentence would have been enough. The other person usually has no idea, because from the outside you look self-sufficient and there is no reason for them even to ask.",
    puvod:
      "Something was missing that a child needs as much as food: attention, warmth, understanding and sensitive guidance. It need not have been neglect. Parents could be careful about what shows, driving you to training and paying for equipment, and unavailable in what is felt. They were busy, cold, emotionally empty themselves, or simply unable to be with a child's feelings. The child does not turn this into a complaint, because it has no other experience; it turns it into a norm. That is precisely why the feeling is so hard to describe: there is no memory of something bad, only a missing memory of something that never happened.",
    pasma: {
      "velmi-nizka":
        "The pattern is practically inactive. You can both receive closeness and give it.",
      "nizka":
        "It shows up only at the margins, in periods when you are poorer in contact.",
      "stredni":
        "The pattern is active. The sense of not being understood returns and colours how you judge the setup around you.",
      "vysoka":
        "The pattern strongly shapes your relationships around sport and who you let close to you.",
      "dominantni":
        "The pattern is dominant. Emotional hunger is the underlying note the other themes rest on. The first step is not more closeness, but being able to ask for it.",
    },
  },
  "04": {
    nazev: "Social exclusion",
    tema: "A sense of difference and of not belonging to the group",
    motto: "I don't belong among the others.",
    prozitek:
      "The basic feeling is loneliness in a group, not loneliness alone. In a group you stand outside, even when nobody is excluding you. There are two forms and they can overlap. The first says: they do not want me. Among the other competitors you feel inadequate, you do not know what to talk about, the others seem more at ease, and you sit the whole shared occasion out, relieved when you can finally leave. The second says: I am different. It need carry no sense of inferiority, more a permanent awareness that you do not belong to this crowd because you are made of other stuff. What matters is that this pattern concerns groups, not close relationships. With individuals you know you may be perfectly comfortable; as soon as there are more people, at a training camp or a squad meet, it fires again. The good news is that its reach is narrow: when a group breaks up into individual conversations, it usually disappears with it.",
    podTlakem:
      "Under pressure you avoid. You do not accept the invitation, do not ask for the floor in a meeting, do not push your idea in front of the others, and at a shared occasion you stay on the edge. Every avoidance brings short-term relief and confirms the pattern in the long run, because the experience that would disprove it never gets a chance to happen. And it always has a reasonable explanation: tiredness, recovery, another commitment.",
    puvod:
      "Unlike emotional hunger, this pattern usually does not form at home but among peers. It was exclusion from a crowd, mockery, a family that stood out in some conspicuous way, a transfer to a club where you did not fit, or simply a long period when you were the last one picked. Sometimes a single strong enough period is enough. The child draws a rule about itself, not about that group, and that conclusion is then never re-examined: the crowd that did not accept you back then is long gone, the rule still stands.",
    pasma: {
      "velmi-nizka":
        "The pattern is practically inactive. You move through groups naturally.",
      "nizka":
        "It shows up at the margins, in a new training group or at a meet where you know nobody.",
      "stredni":
        "The pattern is active. In a group you stand more to one side than you would like.",
      "vysoka":
        "The pattern strongly shapes where you go, what you allow yourself to say and how large a group you can bear.",
      "dominantni":
        "The pattern is dominant. The feeling of not belonging is constant and drives your choices. Change will not come from a decision but from repeated experience inside a group.",
    },
  },
  "05": {
    nazev: "Dependence",
    tema: "Uncertainty about deciding on your own",
    motto: "I can't make decisions on my own.",
    prozitek:
      "Deciding on your own feels like something you do not have the strength for. This is not laziness and not real incapacity; you often manage far more than you admit. It is the feeling that without guidance you will not hold up. A new situation in a race raises anxiety, the decision gets put off until the coach gives an instruction, and even after that the doubt remains that it was a mistake. You do not trust your own judgement, so you keep having it confirmed. There is also a reversed form that looks like the exact opposite: an independence so principled that you will not accept help even when you genuinely need it, because accepting it would mean admitting that you are not enough on your own. Both forms rest on the same sentence. The treacherous part is that decisions someone confirms for you add no certainty; the only ones that do are the decisions you make and stand behind yourself.",
    podTlakem:
      "Under pressure decision-making stops. Your eyes go looking for the coach, you wait for an instruction, or you avoid the decision long enough that time makes it for you and the situation closes by itself. Responsibility moves elsewhere, and with it the sense that you have any influence over your own performance. It is not the big decisions that matter here. Certainty is built on the small ones, of which a race has plenty.",
    puvod:
      "The pattern usually grows not from a lack of care but from an excess of it. A parent or a coach who did things for you faster and better, who shielded you from mistakes, who showed anxiety whenever you tried something on your own. The child concludes that the world is more dangerous, and itself less capable, than is true. Sometimes the opposite works too: an environment so unpredictable that independence could not be tried out safely. That is why this pattern so often carries guilt: the parent meant well and the child knows it.",
    pasma: {
      "velmi-nizka":
        "The pattern is practically inactive. In a race you make your own decisions and stand behind them.",
      "nizka":
        "It shows up at the margins, with big or unfamiliar decisions.",
      "stredni":
        "The pattern is active. Without confirmation from outside, deciding becomes markedly harder.",
      "vysoka":
        "The pattern strongly shapes your independence, both in a race and across your career.",
      "dominantni":
        "The pattern is dominant. The question of whether you can manage alone sits under most decisions. Every decision you make on your own takes a piece of the pattern's strength away.",
    },
  },
  "06": {
    nazev: "Vulnerability",
    tema: "Catastrophising, fear of injury and of losing control",
    motto: "Something will happen and I won't hold up.",
    prozitek:
      "You expect something bad to happen, and at the same time that you will be unable to prevent it. The pattern works in two directions at once: it magnifies the danger and shrinks your capacity to face it. That is why calculating how unlikely something is does not help. In sport it usually takes four forms, and you need not have them all. The body and injury, where you monitor every signal and look for what it means. Danger from outside, meaning travel, falls, particular elements or sections of the course. The existential level, meaning the fear that your career could be gone from one day to the next. And loss of control, meaning the fear that at the decisive moment you will not hold yourself together, or will break down in front of people. The hardest part is usually that anxiety does not decrease because nothing happens: every day without disaster is only a day when it has not come yet. Anxiety does not confuse probability with possibility by accident. As long as something is possible, the body counts it as a threat.",
    podTlakem:
      "Under pressure your options narrow. You decide so as to minimise risk, not to achieve anything. Elements, sections of the course or tactical choices that would pay off are avoided before there is time to weigh them, and attention stays on what could go wrong. It shows up most clearly after a return from injury: the movement is technically fine, the body just keeps avoiding it.",
    puvod:
      "Behind the pattern there is usually an adult who presented the world as a dangerous place. An overprotective parent who warned against everything, lived in anxiety themselves and made clear that calamity was waiting outside. Or, conversely, real threat in childhood: serious illness in the family, an accident, poverty, an unstable home. The child takes two convictions from it at once: that the world is dangerous and that it is not equal to it. It does not remember the warnings, it remembers the tone, and that is exactly why numbers and statistics do not work on it.",
    pasma: {
      "velmi-nizka":
        "The pattern is practically inactive. You see risk factually and in proportion.",
      "nizka":
        "It shows up at the margins, in periods of tiredness or after an injury.",
      "stredni":
        "The pattern is active. Catastrophic scenarios return and take energy before you perform.",
      "vysoka":
        "The pattern strongly shapes what you go into in a race and what you would rather avoid.",
      "dominantni":
        "The pattern is dominant. Expecting threat is the permanent background you make your decisions against. It shrinks by being tested, not by being explained.",
    },
  },
  "07": {
    nazev: "Defectiveness",
    tema: "Shame and the fear that people will find out who you really are",
    motto: "If they got to know me better, they would stop respecting me.",
    prozitek:
      "The main feeling is shame. Not guilt for what you did, but shame for what you are. Somewhere inside you hold the conviction that there is something faulty in you, and that if people saw it they would leave. So it gets hidden: there are parts of yourself you do not show even to the people you train with every day. A gap opens between the person everyone around you knows and the person you think you really are. Unlike the feeling that you do not belong among the others, this pattern grows stronger precisely with closeness: the closer you let someone, the greater the risk of being found out. Two kinds of behaviour follow from it, and they often alternate. Either you avoid closeness, or you choose people who criticise you, because they fit the picture you hold of yourself. Praise, meanwhile, does not stick; it slides off the surface. Criticism lands exactly. The difference from healthy self-criticism lies in where it stops: self-criticism ends at the mistake, shame carries on to a conclusion about who you are.",
    podTlakem:
      "Under pressure shame turns into self-criticism harder than anything your coach would say to you. You cannot get the mistake off your back, not even after a good race. Either you withdraw so there is nothing to find out, which in the decisive moment means easing off, or you get ahead of the criticism by putting yourself down first. And the relief comes from exactly what feeds the pattern: hiding.",
    puvod:
      "The pattern is built by repeated criticism from someone who mattered. A parent or a coach who compared, humiliated, showed disappointment or made love conditional on performance. It need not have been harshness; coldness and constant dissatisfaction are enough. A child has no way of concluding that the problem lies in the adult; it arrives at the only available explanation, which is that it is me. That is why this pattern cannot be overridden by success: performance proves what you can do, and shame speaks about what you are.",
    pasma: {
      "velmi-nizka":
        "The pattern is practically inactive. Your imperfections can bear being seen.",
      "nizka":
        "It shows up at the margins, after a setback or harsh criticism.",
      "stredni":
        "The pattern is active. Shame returns and shapes how much of yourself you show to the people around you.",
      "vysoka":
        "The pattern strongly shapes your relationship with yourself and how close you let people.",
      "dominantni":
        "The pattern is dominant. Shame is the base layer you look at everything else through. It gives way only where someone sees you and does not leave.",
    },
  },
  "08": {
    nazev: "Failure",
    tema: "Distrust of your own performance and impostor syndrome",
    motto: "I'm not good enough for this level.",
    prozitek:
      "When it comes to performance you compare yourself with others and come out of it as the one below average. It is not that you are afraid of demanding tasks. It is the certainty that compared with your peers you have fallen behind, even when the numbers say otherwise. Two forms follow from this. The first is withdrawal: you do not go into situations you would probably manage, because the expected failure cannot be borne. The second is impostor syndrome: you have the results, but you do not count them as yours and you wait for people to find out that you do not belong at this level. The pattern works as a self-fulfilling prophecy: because you do not go all in, or do not go in at all, the results match, and that is then read as confirmation. The distinction from unrelenting standards matters: failure means expecting too little of yourself compared with others, unrelenting standards expecting too much compared with an unreachable mark. And watch who you compare yourself with; the pattern picks the yardstick so that the answer comes out.",
    podTlakem:
      "Under pressure comes delay or escape. You do not go for the risky option, the goal is lowered, the opportunity is let go. Sometimes the opposite comes instead, excessive work but without any joy in the result, because no result is enough to convince. The dangerous part is that delay presents itself as reasonable: there is always a reason why right now is not the moment.",
    puvod:
      "Behind it there is usually an environment where performance was compared and the comparison came out badly. A sibling or another racer held up as the example, a club you could not keep up with, a parent who showed disappointment or, conversely, did not help where you needed it. Sometimes the cause is later physical development than your peers had, or a sport chosen to suit your parents' wishes. That conclusion about your own capacities was reached at a time when you had almost no data, and ever since it has only been confirmed.",
    pasma: {
      "velmi-nizka":
        "The pattern is practically inactive. You trust your abilities in proportion.",
      "nizka":
        "It shows up at the margins, after a setback or at a new level of competition.",
      "stredni":
        "The pattern is active. Comparing yourself with others takes away certainty and the appetite for risk.",
      "vysoka":
        "The pattern strongly shapes what goals you allow yourself and how you read your own results.",
      "dominantni":
        "The pattern is dominant. The expectation of failure precedes most decisions about performance. It gives way only after an experience that cannot be explained away as chance.",
    },
  },
  "09": {
    nazev: "Subjugation",
    tema: "Compliance, self-suppression and lost boundaries",
    motto: "In the end I do what the others want.",
    prozitek:
      "You live by what other people want, and you set your own needs aside so naturally that you often do not even notice. You avoid conflict, you give way as long as you can, and when you do occasionally put yourself first, guilt follows. In sport this is particularly treacherous, because adapting looks like professionalism here: you train through pain, you say nothing about how tired you are, you agree to a training volume your body cannot carry and to a way of preparing that does not suit you. There are two variants. Compliance, where you adapt out of fear of anger or of losing your place. And self-sacrifice, where you adapt because you feel other people's needs so strongly that there is no other way. From the outside it looks like hard work, and often it is hard work. The difference is that here you are not choosing it. Meanwhile anger builds up underneath with nowhere to discharge, and so it comes out indirectly: as passivity, procrastination, tiredness, physical complaints or an unexpected outburst.",
    podTlakem:
      "Under pressure you say yes before you have had time to count your capacity. Your own boundary goes first, and admitting that you cannot do it any more comes last. Exhaustion then does not come from the training, but from the fact that nowhere in it are you counted. You recognise it by tiredness that makes no sense: an ordinary week leaves you with nothing left, because underneath it lies the giving way.",
    puvod:
      "Behind the pattern stands an adult whose will could not safely be refused. A parent who was dominant, unpredictable, punishing, or, conversely, fragile and ill and not to be burdened. Sometimes a coach who punished disagreement by going cold on you. In both cases the child learned that having a need of its own is dangerous or selfish. Its own wanting was therefore muted before it could be spoken, and to this day it appears not as a need but as selfishness.",
    pasma: {
      "velmi-nizka":
        "The pattern is practically inactive. You can name your needs and stand up for them.",
      "nizka":
        "It shows up at the margins, towards your coach or in close relationships.",
      "stredni":
        "The pattern is active. Boundaries hold worse than you would like, especially in conflict.",
      "vysoka":
        "The pattern strongly shapes how much room you have in your own career.",
      "dominantni":
        "The pattern is dominant. Adapting is the default mode and your own wanting barely speaks. The first step is not conflict, but a need spoken out loud inside a safe relationship.",
    },
  },
  "10": {
    nazev: "Unrelenting standards",
    tema: "Never-ending demands and a performance identity",
    motto: "It's never enough.",
    prozitek:
      "The basic feeling is pressure and a shortage of time. Something keeps driving you forward, so there is nowhere to stop, and even recovery turns into a task to be done well. You have to be the best at everything that matters to you; second place does not count. From the outside it looks like professionalism, from the inside like never-ending inadequacy, because the bar moves along with you. Three forms are distinguished and they can overlap. The compulsive form, where everything has to be in perfect order, from your kit to your rituals, and the smallest thing can throw you. The achievement-focused form, where everything including your free time turns into preparation. And the status-focused form, which is about recognition, rankings and admiration, and which tends to compensate for shame or for the feeling that you do not belong. It is usually your relationship and your health that pay first, because both can be postponed and neither says anything straight away. The simplest check is this: when did you last feel it was enough?",
    podTlakem:
      "Under pressure you do not slow down, you speed up. You take on another extra session, another analysis, another responsibility, as though this next thing would finally bring relief. A mistake is punished not by correction but by self-criticism, and recovery is the first thing pushed aside. Adding work is a relief, not a solution. As long as something is being done, there is no time to feel that it is not enough.",
    puvod:
      "The pattern is built by conditional love. Approval came for performance, not for being. One or both parents had demands that could not be met, were perfectionists themselves, held themselves up as the example, or reacted harshly when you did not meet their expectations. For the child, achieving became the way to secure love and safety. That is why the pattern is still wired to the instinct for self-preservation, and why it resists reasonable arguments so stubbornly: for the body, slowing down means risking love.",
    pasma: {
      "velmi-nizka":
        "The pattern is practically inactive. Your standards for yourself are high but bearable.",
      "nizka":
        "It shows up at the margins, in the parts of the season where performance pressure runs highest.",
      "stredni":
        "The pattern is active. The bar is high and recovery is postponed more often than is healthy.",
      "vysoka":
        "The pattern strongly shapes your pace, your relationships and how much rest you allow yourself.",
      "dominantni":
        "The pattern is dominant. Performance is your identity and stopping feels like a threat. Here slowing down is trained as a skill, not adopted as a resolution.",
    },
  },
  "11": {
    nazev: "Entitlement / grandiosity",
    tema: "A claim to an exception, impulse and trouble with the limit",
    motto: "The usual rules don't apply to me.",
    prozitek:
      "You feel that the usual limits do not quite apply to you, and that your needs come first. When your coach contradicts you or thwarts you, anger comes that is out of proportion to the situation. The pattern has three forms and they can overlap. Entitlement, where you claim an exception from the rules that hold for everyone else and do not put yourself in other people's shoes, because it simply does not occur to you. The dependent form, where being exceptional pairs with the expectation that the club or the coach will take care of you, because that is their duty. And the impulsive form, where the problem is bearing discomfort: pleasure is hard to postpone, the dull part of the preparation is hard to finish, and whatever brings short-term relief is hard to stop. From the outside this pattern looks self-assured, and in a talented athlete the people around tolerate it for a long time. Inside there is usually something quite different beneath it, most often shame or emptiness that entitlement drowns out. The most reliable trace is anger at something small.",
    podTlakem:
      "Under pressure your tolerance for restriction drops. Rules, waiting and compromise become unbearable, decisions are made fast and impulsively, and consequences are dealt with afterwards. It is usually the relationships around you that pay before the results do, and that is precisely why the pattern holds so long: its price is paid somewhere other than with you.",
    puvod:
      "Behind the pattern lies either an absence of boundaries, where the child got everything and nobody said no because it was talented, or the opposite, compensation: an environment where the child was humiliated or overlooked, and being exceptional became the way to survive it. Sometimes there is also a parent who displayed the child as proof of their own worth. Both routes lead to the same place: a boundary was never a safe experience. Either it was missing altogether, or it arrived as humiliation.",
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
