import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const REPO = 'mergeos-bounties/Loru';

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function ensureLabel(name, color, description) {
  try {
    sh(
      `gh label create ${JSON.stringify(name)} --repo ${REPO} --color ${color} --description ${JSON.stringify(description)}`,
    );
  } catch {
    try {
      sh(
        `gh label edit ${JSON.stringify(name)} --repo ${REPO} --color ${color} --description ${JSON.stringify(description)}`,
      );
    } catch {
      // ignore
    }
  }
}

function createIssue(title, body, labels) {
  const dir = mkdtempSync(join(tmpdir(), 'loru-gloss-'));
  const file = join(dir, 'body.md');
  try {
    writeFileSync(file, body, 'utf8');
    const labelFlags = labels.map((l) => `--label ${JSON.stringify(l)}`).join(' ');
    const out = sh(
      `gh issue create --repo ${REPO} --title ${JSON.stringify(title)} --body-file ${JSON.stringify(file)} ${labelFlags}`,
    );
    console.log(out);
    return out;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

for (const [name, color, description] of [
  ['sign-pack', 'BFDADC', 'Per-gloss / gesture contribution pack'],
  ['photo', 'FBCA04', 'Needs contributor photos or short video'],
  ['gesture', 'D4C5F9', 'Handshape / body movement / sign gloss'],
  ['vsl', '0E8A16', 'Vietnamese Sign Language related'],
  ['reward:25-mrg', 'FEF2C0', 'Target 25 MRG'],
]) {
  ensureLabel(name, color, description);
}

const footer = `

## Claim (MergeOS MRG)

1. Follow https://github.com/mergeos-bounties  
2. Star https://github.com/mergeos-bounties/mergeos  
3. Star https://github.com/mergeos-bounties/mergeos-contracts
4. Comment on **this issue**: \`I claim this bounty\`  
5. Comment on MergeOS [Claim Token #1](https://github.com/mergeos-bounties/mergeos/issues/1) with this issue link  
6. Open a PR to **Loru** with \`Fixes #<this-issue>\`

Policy: [docs/BOUNTY.md](../blob/master/docs/BOUNTY.md)

## Payout

Maintainer reviews PR → merge → **MRG credit** (typically **25 MRG** per gloss pack on the 25/50/100/200 scale).
`;

/**
 * Isolated gloss / handshape / body-movement packs.
 * Contributors capture consented photos/short clips + landmark sample JSON.
 */
const signs = [
  // Everyday survival signs
  { id: 'hello', cat: 'greetings', desc: 'Wave / open-hand greeting near head or mid-space', hand: 'open B or 5-hand wave', motion: 'small lateral wave' },
  { id: 'goodbye', cat: 'greetings', desc: 'Farewell wave', hand: 'open hand', motion: 'wave away from body' },
  { id: 'thanks', cat: 'manners', desc: 'Thank you — flat hand from chin outward', hand: 'flat B-hand at chin', motion: 'forward arc away from face' },
  { id: 'please', cat: 'manners', desc: 'Please — flat hand circles on chest', hand: 'flat hand on chest', motion: 'circular rub on sternum' },
  { id: 'sorry', cat: 'manners', desc: 'Sorry — fist circles on chest', hand: 'A-hand / fist', motion: 'circle on chest' },
  { id: 'yes', cat: 'core', desc: 'Yes — nodding fist like head nod', hand: 'S-hand / fist', motion: 'nod at wrist' },
  { id: 'no', cat: 'core', desc: 'No — index+middle snap to thumb', hand: '2-hand closing', motion: 'snap closed once/twice' },
  { id: 'help', cat: 'core', desc: 'Help — fist on flat palm lifts', hand: 'A on open palm', motion: 'lift upward together' },
  { id: 'stop', cat: 'core', desc: 'Stop — chop flat hand onto palm', hand: 'flat hand + open palm', motion: 'edge hits palm' },
  { id: 'wait', cat: 'core', desc: 'Wait — open hands wiggle fingers up', hand: '5-hands up', motion: 'finger flutter' },
  { id: 'more', cat: 'core', desc: 'More — tips of both hands tap', hand: 'flattened O both hands', motion: 'tap together' },
  { id: 'done_finish', cat: 'core', desc: 'Finish / done — flip hands outward', hand: '5-hands facing in', motion: 'flip palms out' },
  { id: 'want', cat: 'core', desc: 'Want — claw hands pull toward body', hand: 'claw 5', motion: 'pull in toward torso' },
  { id: 'need', cat: 'core', desc: 'Need — X-hand nods downward', hand: 'X-hand', motion: 'firm downward nod' },
  { id: 'like', cat: 'emotion', desc: 'Like — middle finger+thumb pull from chest', hand: '8-hand open', motion: 'pull out to open' },
  { id: 'love', cat: 'emotion', desc: 'Love — cross arms on chest (or ILY)', hand: 'S-hands crossed or ILY', motion: 'hold / brief cross' },
  { id: 'happy', cat: 'emotion', desc: 'Happy — flat hands brush up chest', hand: 'flat hands', motion: 'upward brushes on chest' },
  { id: 'sad', cat: 'emotion', desc: 'Sad — 5-hands drop down face', hand: '5-hands at face', motion: 'downward along face' },
  { id: 'angry', cat: 'emotion', desc: 'Angry — claw on face pulls out', hand: 'claw on face', motion: 'pull forward slightly' },
  { id: 'scared', cat: 'emotion', desc: 'Scared — hands snap open on chest', hand: 'S to 5 on chest', motion: 'sudden open' },
  { id: 'tired', cat: 'emotion', desc: 'Tired — bent hands drop on chest', hand: 'bent B on chest', motion: 'fingertips drop in' },
  { id: 'fine_ok', cat: 'core', desc: 'Fine / OK — thumb of 5-hand touches chest', hand: '5-hand', motion: 'thumb taps chest' },
  { id: 'good', cat: 'core', desc: 'Good — flat hand from chin to palm', hand: 'flat hand', motion: 'chin down onto palm' },
  { id: 'bad', cat: 'core', desc: 'Bad — flat hand from chin flips down', hand: 'flat hand', motion: 'chin then flip down' },
  { id: 'name', cat: 'identity', desc: 'Name — H-hands tap across', hand: 'H / U both hands', motion: 'tap twice across' },
  { id: 'me_i', cat: 'pronoun', desc: 'I / me — point to self', hand: 'index point', motion: 'point to chest' },
  { id: 'you', cat: 'pronoun', desc: 'You — point to person', hand: 'index point', motion: 'point forward' },
  { id: 'we', cat: 'pronoun', desc: 'We — index sweeps inclusive', hand: 'index', motion: 'sweep from self to group' },
  { id: 'they', cat: 'pronoun', desc: 'They — index points along arc', hand: 'index', motion: 'arc pointing multiple' },
  { id: 'what', cat: 'question', desc: 'What — palms up, slight shake', hand: 'open palms up', motion: 'small side shake' },
  { id: 'where', cat: 'question', desc: 'Where — index finger wiggles', hand: 'index up', motion: 'side-to-side wiggle' },
  { id: 'when', cat: 'question', desc: 'When — index circles index', hand: 'index both', motion: 'circle then touch' },
  { id: 'who', cat: 'question', desc: 'Who — L/thumb at chin, index wiggle', hand: 'L near chin', motion: 'index flex' },
  { id: 'why', cat: 'question', desc: 'Why — mid finger on forehead flicks out', hand: 'mid finger brow', motion: 'flick to Y' },
  { id: 'how', cat: 'question', desc: 'How — bent hands back-to-back roll', hand: 'bent hands together', motion: 'roll forward' },
  { id: 'which', cat: 'question', desc: 'Which — A-thumbs alternate up/down', hand: 'A both', motion: 'alternate raise' },
  // Family / people
  { id: 'mother', cat: 'family', desc: 'Mother — thumb of 5-hand on chin', hand: '5-hand', motion: 'thumb to chin' },
  { id: 'father', cat: 'family', desc: 'Father — thumb of 5-hand on forehead', hand: '5-hand', motion: 'thumb to forehead' },
  { id: 'brother', cat: 'family', desc: 'Brother — L at brow then both L together', hand: 'L-hands', motion: 'brow then meet' },
  { id: 'sister', cat: 'family', desc: 'Sister — L at chin then both L together', hand: 'L-hands', motion: 'chin then meet' },
  { id: 'baby', cat: 'family', desc: 'Baby — arms rock cradle', hand: 'arms folded', motion: 'rocking cradle' },
  { id: 'friend', cat: 'people', desc: 'Friend — index hooks interlock', hand: 'indexes', motion: 'hook, swap, hook' },
  { id: 'teacher', cat: 'people', desc: 'Teacher — flat-O both near head then person', hand: 'flat-O + person ending', motion: 'open near temples then down' },
  { id: 'student', cat: 'people', desc: 'Student — grab knowledge from palm to head + person', hand: 'flat-O + person', motion: 'palm to forehead then person' },
  { id: 'doctor', cat: 'people', desc: 'Doctor — M fingertips on pulse', hand: 'M-hand on wrist', motion: 'tap pulse' },
  // Food / drink
  { id: 'water', cat: 'food', desc: 'Water — W-hand taps chin', hand: 'W-hand', motion: 'tap chin' },
  { id: 'eat_food', cat: 'food', desc: 'Eat / food — flat-O to mouth', hand: 'flat-O', motion: 'to mouth 1–2x' },
  { id: 'drink', cat: 'food', desc: 'Drink — C-hand tips to mouth', hand: 'C-hand', motion: 'tip like cup' },
  { id: 'milk', cat: 'food', desc: 'Milk — squeeze fist like milking', hand: 'open to S', motion: 'squeeze twice' },
  { id: 'coffee', cat: 'food', desc: 'Coffee — S-hand grinds on S', hand: 'S on S', motion: 'circular grind' },
  { id: 'tea', cat: 'food', desc: 'Tea — F-hand dips in O', hand: 'F into O', motion: 'dip circle' },
  { id: 'hungry', cat: 'food', desc: 'Hungry — C-hand down chest', hand: 'C-hand', motion: 'down center chest' },
  { id: 'thirsty', cat: 'food', desc: 'Thirsty — index down throat', hand: 'index', motion: 'down throat line' },
  { id: 'bread', cat: 'food', desc: 'Bread — knife hand slices on hand', hand: 'flat + knife edge', motion: 'slice arcs' },
  { id: 'rice', cat: 'food', desc: 'Rice — scoop to mouth (common ASL variant)', hand: 'curved scoop', motion: 'scoop up' },
  { id: 'fruit', cat: 'food', desc: 'Fruit — F-hand twists at cheek', hand: 'F on cheek', motion: 'twist' },
  { id: 'vegetable', cat: 'food', desc: 'Vegetable — index on cheek twists', hand: 'index cheek', motion: 'twist' },
  // Places / time
  { id: 'home', cat: 'place', desc: 'Home — flat-O cheek to corner mouth', hand: 'flat-O', motion: 'cheek then mouth corner' },
  { id: 'school', cat: 'place', desc: 'School — clap flat hands twice', hand: 'flat hands', motion: 'clap clap' },
  { id: 'work', cat: 'place', desc: 'Work — S-hand taps on S', hand: 'S on S', motion: 'tap wrist area' },
  { id: 'hospital', cat: 'place', desc: 'Hospital — H draws cross on shoulder', hand: 'H-hand', motion: 'cross on upper arm' },
  { id: 'store', cat: 'place', desc: 'Store — flat-O both hands flip out', hand: 'flat-O both', motion: 'flip forward twice' },
  { id: 'bathroom', cat: 'place', desc: 'Bathroom — T-hand shakes', hand: 'T-hand', motion: 'small shake' },
  { id: 'today', cat: 'time', desc: 'Today — Y-hands drop down', hand: 'Y both', motion: 'drop once' },
  { id: 'tomorrow', cat: 'time', desc: 'Tomorrow — A-thumb from cheek forward', hand: 'A-hand', motion: 'cheek arc forward' },
  { id: 'yesterday', cat: 'time', desc: 'Yesterday — A-thumb from cheek back', hand: 'A-hand', motion: 'cheek back along jaw' },
  { id: 'now', cat: 'time', desc: 'Now — Y-hands drop firmly', hand: 'Y both palms up', motion: 'drop' },
  { id: 'later', cat: 'time', desc: 'Later — L pivots on palm', hand: 'L on palm', motion: 'pivot forward' },
  { id: 'time', cat: 'time', desc: 'Time — index taps wrist', hand: 'index on wrist', motion: 'tap watch area' },
  { id: 'morning', cat: 'time', desc: 'Morning — flat hand rises from arm', hand: 'flat on forearm', motion: 'rise like sun' },
  { id: 'night', cat: 'time', desc: 'Night — bent hand over wrist down', hand: 'bent over arm', motion: 'over like sunset' },
  // Actions / verbs
  { id: 'go', cat: 'action', desc: 'Go — indexes point and move forward', hand: 'indexes', motion: 'forward together' },
  { id: 'come', cat: 'action', desc: 'Come — indexes beckon toward self', hand: 'indexes', motion: 'beckon in' },
  { id: 'walk', cat: 'action', desc: 'Walk — inverted V fingers walk', hand: 'V down', motion: 'walk fingers' },
  { id: 'run', cat: 'action', desc: 'Run — L-hands hook and pull forward fast', hand: 'L hook', motion: 'pull forward quickly' },
  { id: 'sit', cat: 'action', desc: 'Sit — U-hands hook sit on U', hand: 'U on U', motion: 'sit down motion' },
  { id: 'stand', cat: 'action', desc: 'Stand — V stands on palm', hand: 'V on palm', motion: 'upright on palm' },
  { id: 'sleep', cat: 'action', desc: 'Sleep — open hand to flat-O at face', hand: '5 to flat-O', motion: 'to face close eyes' },
  { id: 'wake_up', cat: 'action', desc: 'Wake up — closed at eyes open to L', hand: 'closed to L at eyes', motion: 'open wide' },
  { id: 'see', cat: 'action', desc: 'See — V from eyes forward', hand: 'V at eyes', motion: 'forward' },
  { id: 'look', cat: 'action', desc: 'Look — V points then aims', hand: 'V', motion: 'point direction of gaze' },
  { id: 'hear', cat: 'action', desc: 'Hear — index to ear', hand: 'index', motion: 'to ear' },
  { id: 'listen', cat: 'action', desc: 'Listen — C-hand at ear', hand: 'C at ear', motion: 'hold / slight cup' },
  { id: 'speak_talk', cat: 'action', desc: 'Talk / speak — index circles at mouth', hand: 'index 4 at mouth', motion: 'forward circles' },
  { id: 'write', cat: 'action', desc: 'Write — mime pen on palm', hand: 'writing hand + palm', motion: 'write strokes' },
  { id: 'read', cat: 'action', desc: 'Read — V scans down palm', hand: 'V over palm', motion: 'scan down page' },
  { id: 'open', cat: 'action', desc: 'Open — flat hands flip open', hand: 'flat pair', motion: 'open like book/door' },
  { id: 'close', cat: 'action', desc: 'Close — flat hands shut', hand: 'flat pair', motion: 'close together' },
  { id: 'give', cat: 'action', desc: 'Give — flat-O moves toward person', hand: 'flat-O', motion: 'toward recipient' },
  { id: 'take', cat: 'action', desc: 'Take — open hand grabs toward self', hand: '5 to S', motion: 'grab in' },
  { id: 'buy', cat: 'action', desc: 'Buy — flat-O from palm forward', hand: 'flat-O on palm', motion: 'forward spend' },
  { id: 'pay', cat: 'action', desc: 'Pay — index slides off palm forward', hand: 'index on palm', motion: 'slide out' },
  { id: 'play', cat: 'action', desc: 'Play — Y-hands shake', hand: 'Y both', motion: 'shake outward' },
  { id: 'work_action', cat: 'action', desc: 'Work (verb emphasis) — S taps S firmly', hand: 'S on S', motion: 'repeated taps' },
  { id: 'learn', cat: 'action', desc: 'Learn — grab from palm to forehead', hand: 'flat-O', motion: 'palm to forehead' },
  { id: 'teach', cat: 'action', desc: 'Teach — flat-O both near head push out', hand: 'flat-O both', motion: 'from temples out' },
  { id: 'understand', cat: 'action', desc: 'Understand — S at forehead flicks index up', hand: 'S to 1 at brow', motion: 'flick up' },
  { id: 'know', cat: 'action', desc: 'Know — flat hand taps forehead', hand: 'flat hand', motion: 'tap brow' },
  { id: 'dont_know', cat: 'action', desc: "Don't know — flat hand flips off forehead", hand: 'flat hand', motion: 'flip out from brow' },
  { id: 'remember', cat: 'action', desc: 'Remember — thumb from brow to thumb', hand: 'A to A', motion: 'brow thumb to other thumb' },
  { id: 'forget', cat: 'action', desc: 'Forget — open hand wipes across brow to fist', hand: 'open to A', motion: 'wipe forehead' },
  // Descriptors / adjectives
  { id: 'big', cat: 'descriptor', desc: 'Big — curved hands pull apart', hand: 'curved hands', motion: 'apart' },
  { id: 'small', cat: 'descriptor', desc: 'Small — flat hands approach', hand: 'flat parallel', motion: 'closer' },
  { id: 'hot', cat: 'descriptor', desc: 'Hot — claw at mouth flips out', hand: 'claw at mouth', motion: 'flip away' },
  { id: 'cold', cat: 'descriptor', desc: 'Cold — S-hands shake at shoulders', hand: 'S both', motion: 'shiver shake' },
  { id: 'fast', cat: 'descriptor', desc: 'Fast — thumb flicks off index quickly', hand: 'L / thumb flick', motion: 'quick flick' },
  { id: 'slow', cat: 'descriptor', desc: 'Slow — hand slides slowly up other hand', hand: 'flat on hand', motion: 'slow slide' },
  { id: 'beautiful', cat: 'descriptor', desc: 'Beautiful — 5 circles face to flat-O', hand: '5 around face', motion: 'circle to close' },
  { id: 'ugly', cat: 'descriptor', desc: 'Ugly — index hooks across face', hand: 'index under nose', motion: 'hook across' },
  { id: 'clean', cat: 'descriptor', desc: 'Clean — flat hand slides across palm', hand: 'flat on palm', motion: 'wipe across' },
  { id: 'dirty', cat: 'descriptor', desc: 'Dirty — under chin fingers wiggle', hand: '5 under chin', motion: 'wiggle' },
  // Numbers 1-10 (handshapes)
  { id: 'number_1', cat: 'number', desc: 'Number 1 — index up', hand: 'index', motion: 'static or slight push' },
  { id: 'number_2', cat: 'number', desc: 'Number 2 — V-hand', hand: 'V', motion: 'static' },
  { id: 'number_3', cat: 'number', desc: 'Number 3 — thumb+index+middle', hand: '3-hand', motion: 'static' },
  { id: 'number_4', cat: 'number', desc: 'Number 4 — four fingers', hand: '4-hand', motion: 'static' },
  { id: 'number_5', cat: 'number', desc: 'Number 5 — open hand', hand: '5-hand', motion: 'static' },
  { id: 'number_6', cat: 'number', desc: 'Number 6 — pinky touches thumb tip (ASL)', hand: '6-hand', motion: 'static' },
  { id: 'number_7', cat: 'number', desc: 'Number 7 — ring touches thumb (ASL)', hand: '7-hand', motion: 'static' },
  { id: 'number_8', cat: 'number', desc: 'Number 8 — mid touches thumb (ASL)', hand: '8-hand', motion: 'static' },
  { id: 'number_9', cat: 'number', desc: 'Number 9 — index touches thumb (ASL F-ish)', hand: '9-hand', motion: 'static' },
  { id: 'number_10', cat: 'number', desc: 'Number 10 — A-thumb nods/shakes', hand: 'A-thumb up', motion: 'twist/shake' },
  // Handshapes catalog (for model training)
  { id: 'handshape_a', cat: 'handshape', desc: 'Handshape A — fist, thumb beside', hand: 'A', motion: 'hold clear view front+side' },
  { id: 'handshape_b', cat: 'handshape', desc: 'Handshape B — flat fingers together, thumb tucked', hand: 'B', motion: 'hold' },
  { id: 'handshape_c', cat: 'handshape', desc: 'Handshape C — curved C', hand: 'C', motion: 'hold' },
  { id: 'handshape_d', cat: 'handshape', desc: 'Handshape D — index up, others touch thumb', hand: 'D', motion: 'hold' },
  { id: 'handshape_f', cat: 'handshape', desc: 'Handshape F — OK ring, other fingers up', hand: 'F', motion: 'hold' },
  { id: 'handshape_g', cat: 'handshape', desc: 'Handshape G — index+thumb horizontal gun-like', hand: 'G', motion: 'hold' },
  { id: 'handshape_i', cat: 'handshape', desc: 'Handshape I — pinky up', hand: 'I', motion: 'hold' },
  { id: 'handshape_l', cat: 'handshape', desc: 'Handshape L — L shape', hand: 'L', motion: 'hold' },
  { id: 'handshape_o', cat: 'handshape', desc: 'Handshape O — fingertips touch thumb O', hand: 'O', motion: 'hold' },
  { id: 'handshape_s', cat: 'handshape', desc: 'Handshape S — fist thumb over fingers', hand: 'S', motion: 'hold' },
  { id: 'handshape_v', cat: 'handshape', desc: 'Handshape V — peace / V', hand: 'V', motion: 'hold' },
  { id: 'handshape_w', cat: 'handshape', desc: 'Handshape W — three fingers W', hand: 'W', motion: 'hold' },
  { id: 'handshape_y', cat: 'handshape', desc: 'Handshape Y — thumb+pinky out', hand: 'Y', motion: 'hold' },
  { id: 'handshape_ily', cat: 'handshape', desc: 'I-L-Y handshape (I love you)', hand: 'ILY', motion: 'hold / slight wave' },
  // Body / space movements
  { id: 'body_shift_left', cat: 'body', desc: 'Role-shift / torso lean left (discourse)', hand: 'neutral or hold sign', motion: 'torso+gaze left' },
  { id: 'body_shift_right', cat: 'body', desc: 'Role-shift / torso lean right', hand: 'neutral or hold sign', motion: 'torso+gaze right' },
  { id: 'nod_affirm', cat: 'body', desc: 'Head nod affirmation (NMM)', hand: 'optional', motion: 'head nod 2–3x' },
  { id: 'headshake_negate', cat: 'body', desc: 'Headshake negation (NMM)', hand: 'optional', motion: 'headshake' },
  { id: 'eyebrows_raised_question', cat: 'body', desc: 'Raised brows yes/no question face', hand: 'any WH/yes-no context', motion: 'brows up + lean' },
  { id: 'eyebrows_furrowed_wh', cat: 'body', desc: 'Furrowed brows WH-question face', hand: 'WH sign context', motion: 'brows down' },
  { id: 'point_locus_left', cat: 'body', desc: 'Index point to left spatial locus', hand: 'index', motion: 'point left space' },
  { id: 'point_locus_right', cat: 'body', desc: 'Index point to right spatial locus', hand: 'index', motion: 'point right space' },
  { id: 'classifier_vehicle_drive', cat: 'classifier', desc: 'CL:3 vehicle moves forward', hand: '3-hand classifier', motion: 'forward path' },
  { id: 'classifier_person_walk', cat: 'classifier', desc: 'CL:1 person walks path', hand: '1-hand upright', motion: 'walk path arc' },
  { id: 'classifier_flat_object', cat: 'classifier', desc: 'CL:B flat object placement', hand: 'B-hand', motion: 'place in space' },
  // Emergency / access
  { id: 'emergency', cat: 'emergency', desc: 'Emergency — E-hands shake out', hand: 'E both', motion: 'shake out' },
  { id: 'pain_hurt', cat: 'emergency', desc: 'Hurt / pain — indexes jab toward each other', hand: 'indexes', motion: 'jab mid-air' },
  { id: 'medicine', cat: 'emergency', desc: 'Medicine — mid finger tip on palm circles', hand: 'mid on palm', motion: 'small circle' },
  { id: 'allergy', cat: 'emergency', desc: 'Allergy — A at nose flips out (variant OK if documented)', hand: 'A at nose', motion: 'flip out' },
  { id: 'call_phone', cat: 'tech', desc: 'Phone / call — Y at ear/mouth', hand: 'Y-hand', motion: 'to cheek' },
  { id: 'internet', cat: 'tech', desc: 'Internet — mid fingers touch and rock', hand: 'mid fingertips', motion: 'rock contact' },
  { id: 'computer', cat: 'tech', desc: 'Computer — C-hands circle', hand: 'C both', motion: 'circles' },
  // VSL / Vietnam-relevant everyday (document local variant in PR)
  { id: 'vsl_hello', cat: 'vsl', desc: 'VSL-oriented greeting (document local handshape/path used)', hand: 'document in PR', motion: 'document in PR', vsl: true },
  { id: 'vsl_thanks', cat: 'vsl', desc: 'VSL thank-you variant (document regional form)', hand: 'document in PR', motion: 'document in PR', vsl: true },
  { id: 'vsl_yes', cat: 'vsl', desc: 'VSL yes / affirmation', hand: 'document in PR', motion: 'document in PR', vsl: true },
  { id: 'vsl_no', cat: 'vsl', desc: 'VSL no / negation', hand: 'document in PR', motion: 'document in PR', vsl: true },
  { id: 'vsl_eat', cat: 'vsl', desc: 'VSL eat / meal', hand: 'document in PR', motion: 'document in PR', vsl: true },
  { id: 'vsl_drink', cat: 'vsl', desc: 'VSL drink', hand: 'document in PR', motion: 'document in PR', vsl: true },
  { id: 'vsl_home', cat: 'vsl', desc: 'VSL home / house', hand: 'document in PR', motion: 'document in PR', vsl: true },
  { id: 'vsl_school', cat: 'vsl', desc: 'VSL school', hand: 'document in PR', motion: 'document in PR', vsl: true },
  { id: 'vsl_mother', cat: 'vsl', desc: 'VSL mother', hand: 'document in PR', motion: 'document in PR', vsl: true },
  { id: 'vsl_father', cat: 'vsl', desc: 'VSL father', hand: 'document in PR', motion: 'document in PR', vsl: true },
  { id: 'vsl_friend', cat: 'vsl', desc: 'VSL friend', hand: 'document in PR', motion: 'document in PR', vsl: true },
  { id: 'vsl_love', cat: 'vsl', desc: 'VSL love / like strong affect', hand: 'document in PR', motion: 'document in PR', vsl: true },
  { id: 'vsl_help', cat: 'vsl', desc: 'VSL help', hand: 'document in PR', motion: 'document in PR', vsl: true },
  { id: 'vsl_sorry', cat: 'vsl', desc: 'VSL sorry / apologize', hand: 'document in PR', motion: 'document in PR', vsl: true },
  { id: 'vsl_name', cat: 'vsl', desc: 'VSL name / introduce name', hand: 'document in PR', motion: 'document in PR', vsl: true },
  { id: 'vsl_vietnam', cat: 'vsl', desc: 'VSL Vietnam (country sign — document form)', hand: 'document in PR', motion: 'document in PR', vsl: true },
  { id: 'vsl_hanoi', cat: 'vsl', desc: 'VSL Hanoi (if known; else city fingerspell note)', hand: 'document in PR', motion: 'document in PR', vsl: true },
  { id: 'vsl_saigon', cat: 'vsl', desc: 'VSL Saigon/HCM (document local form)', hand: 'document in PR', motion: 'document in PR', vsl: true },
  { id: 'vsl_rice', cat: 'vsl', desc: 'VSL rice / meal staple', hand: 'document in PR', motion: 'document in PR', vsl: true },
  { id: 'vsl_water', cat: 'vsl', desc: 'VSL water', hand: 'document in PR', motion: 'document in PR', vsl: true },
  // Fingerspelling letters A-Z (handshapes)
  ...('abcdefghijklmnopqrstuvwxyz'.split('').map((ch) => ({
    id: `fingerspell_${ch}`,
    cat: 'fingerspell',
    desc: `ASL fingerspelling letter ${ch.toUpperCase()} (or document VSL manual alphabet if different)`,
    hand: `letter ${ch.toUpperCase()}`,
    motion: 'static clear view; optional slight emphasis',
  }))),
];

const baseLabels = ['bounty', 'bounty: feature', 'data', 'sign-pack', 'photo', 'gesture', 'reward:25-mrg', 'good first issue'];

for (const s of signs) {
  const labels = [...baseLabels];
  if (s.vsl || s.cat === 'vsl') labels.push('vsl');

  const title = `[25 MRG] Sign pack: \`${s.id}\` (${s.cat}) — photo/video + landmarks`;
  const body = `## Bounty: 25 MRG — gloss / gesture pack

Add isolated sign **\`${s.id}\`** to Loru so sign→text / sign→voice can learn it.

| Field | Value |
| --- | --- |
| **Gloss id** | \`${s.id}\` |
| **Category** | ${s.cat} |
| **Description** | ${s.desc} |
| **Handshape (hint)** | ${s.hand} |
| **Motion (hint)** | ${s.motion} |

> Hints above are **starting points** (often ASL-like). If you contribute **VSL** or another language, **document the exact form** in the PR (and set \`language\` in the sample JSON). Regional variants are welcome when consented and labeled.

## What to deliver (PR)

1. **Sample sequence JSON** — \`data/samples/${s.id}.json\` (or \`data/samples/<lang>/${s.id}.json\`)
   - \`gloss\`: \`${s.id}\`
   - \`language\`: e.g. \`demo-asl\`, \`vsl\`, \`asl\`
   - \`fps\`, \`source\`: \`contributor-capture\` + your handle
   - \`frames\`: landmark frames (hands; pose optional)
     - Prefer MediaPipe-style lists of \`[x,y,z]\` per landmark
     - Or synthetic but **distinct** prototype if you cannot run vision yet — mark \`source\` honestly
   - Optional: \`notes\` describing handshape/path/NMM

2. **Register gloss** — extend \`DEFAULT_GLOSS\` in \`src/loru/models/vocab.py\` **or** add to a new vocab file if the project already supports external vocab (follow current code).

3. **Sentence template** — add a natural-language string for this gloss in \`gloss_to_sentence\` (or multi-gloss pack).

4. **Evidence (required)** — in the PR body:
   - ≥ **2 still photos** of the sign (start pose + end / peak pose), **or**
   - 1 short **video clip** (≤5s) of the isolated sign
   - Must be **original / consented**. No scraped private faces without permission.
   - Blur faces if the signer prefers privacy (hands+torso enough).

5. **Verify**
   \`\`\`bash
   pip install -e ".[dev]"
   # after adding sample:
   loru data list
   loru infer text --sequence data/samples/${s.id}.json
   pytest -q
   ruff check src tests
   \`\`\`

## Acceptance

- [ ] Sample JSON merged with correct \`gloss\`
- [ ] Vocab + text template updated
- [ ] Photo/video evidence linked in PR
- [ ] Consent / ethics note in PR (who signed; permission)
- [ ] Tests + ruff pass
- [ ] Language labeled (\`asl\` / \`vsl\` / other)

## Ethics

- Only consented signers (yourself OK).
- Do not claim clinical accuracy for assistive use without evaluation.
- Prefer open documentation of which sign language variety you captured.
${footer}`;

  createIssue(title, body, labels);
}

console.log(`Created ${signs.length} sign/gesture bounty issues on ${REPO}`);
