const animals = {
  randy: { name: 'Randy Ruffle', species: 'Dog', icon: '🐶' },
  mia: { name: 'Mia Purrcy', species: 'Cat', icon: '🐱' },
  jamie: { name: 'Jamie Gallop', species: 'Horse', icon: '🐴' },
  penelope: { name: 'Penelope Snout', species: 'Pig', icon: '🐷' },
  oliver: { name: 'Oliver Hooty', species: 'Owl', icon: '🦉' },
  parker: { name: 'Parker Redly', species: 'Red panda', icon: '🐾' },
  king: { name: 'King Mane', species: 'Lion', icon: '🦁' }
};
const letters = [
  { sender: 'randy', recipient: 'mia', clue: 'Can we call a truce? The fence is a silly place to spend a whole afternoon arguing. I’ve left my favourite tennis ball by the gate as a peace offering. It’s a little chewed, but it still bounces.' },
  { sender: 'mia', recipient: 'jamie', clue: 'Thanks for letting me stay while it rained. I hope you didn’t mind me taking the sunny windowsill. I tried to help with that scratching sound behind your oat sack, but it got away through a hole in the wall.' },
  { sender: 'jamie', recipient: 'penelope', clue: 'I can help pull your cart to market on Saturday. Let’s take the lane by the apple trees. The cobbles in town are loud under my new shoes, and there’s no need to wake everyone that early.' },
  { sender: 'penelope', recipient: 'oliver', clue: 'Your parcel is safe with me. I took a shortcut through the orchard and got a bit carried away digging for treats. I washed up before I wrapped it again, although one corner might still have a smudge.' },
  { sender: 'oliver', recipient: 'parker', clue: 'Your basket is on the highest shelf by the window. I spotted it in the moonlight on my way home and put it out of reach of the mice. Leave your curtains open tonight and I’ll show you which shelf.' },
  { sender: 'parker', recipient: 'king', clue: 'The postcard arrived! Your grasslands look a lot warmer than my mountain home. I’ll bring something from the bamboo grove when I visit. If I drop it climbing down, look for the branch where my tail was hanging.' },
  { sender: 'king', recipient: 'randy', clue: 'Your tennis ball rolled past my rock again. You can collect it after my afternoon nap. My family will be resting in the tall grass too. I’m still picking seeds out of the ruff around my neck. Call from the path and I’ll answer loudly enough for the whole valley to hear.' }
];
const get = id => document.getElementById(id);
let index = 0;
let solved = 0;

function showProgress() {
  get('count').textContent = `${solved} of ${letters.length} letters solved`;
  get('steps').replaceChildren(...letters.map((_, position) => {
    const step = document.createElement('span');
    const done = position < solved;
    step.className = done ? 'step done' : position === index ? 'step current' : 'step';
    step.textContent = done ? '✓' : position + 1;
    step.setAttribute('aria-label', `Letter ${position + 1}${done ? ', solved' : ''}`);
    if (position === index) step.setAttribute('aria-current', 'step');
    return step;
  }));
}

function showLetter() {
  const letter = letters[index];
  get('next').hidden = true;
  get('feedback').textContent = '';
  get('number').textContent = `Letter ${index + 1} of ${letters.length}`;
  get('greeting').textContent = `Dear ${animals[letter.recipient].name},`;
  get('signature').textContent = 'From, your mystery sender';
  get('clue').textContent = letter.clue;
  get('signature').hidden = false;
  get('guess-title').textContent = 'Who sent it?';
  get('choices').replaceChildren(...Object.keys(animals).sort((a, b) => animals[a].species.localeCompare(animals[b].species)).map(sender => {
    const animal = animals[sender];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'choice';
    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = animal.icon;
    button.append(icon, animal.species);
    button.addEventListener('click', () => checkGuess(sender, button));
    return button;
  }));
  showProgress();
}

function checkGuess(sender, button) {
  const animal = animals[sender].name;
  if (sender !== letters[index].sender) {
    button.classList.add('wrong');
    get('feedback').textContent = `${animals[sender].species} didn’t send this letter. Read the clues and try again!`;
    return;
  }
  solved++;
  get('signature').textContent = `From, ${animal}`;
  button.classList.add('correct');
  get('choices').querySelectorAll('button').forEach(choice => { choice.disabled = true; });
  get('feedback').textContent = `You got it! This letter came from ${animal}.`;
  get('next').textContent = solved === letters.length ? 'Finish sorting' : 'Next letter';
  get('next').hidden = false;
  get('next').focus();
  showProgress();
}

function finish() {
  get('number').textContent = 'Special delivery';
  get('greeting').textContent = 'All mail sorted!';
  get('clue').textContent = 'You found every mystery sender, Sierra. Your shift at the post office is done!';
  get('signature').hidden = true;
  get('guess-title').textContent = 'The night bell';
  get('choices').replaceChildren();
  get('feedback').textContent = 'Ding! It’s night. Time to close the post office.';
  get('next').textContent = 'Go outside';
  get('put-down').hidden = true;
}

get('next').addEventListener('click', () => {
  if (index === letters.length) {
    leaveAfterSorting();
    return;
  }
  index++;
  if (index === letters.length) {
    finish();
    ringNightBell();
  } else {
    showLetter();
  }
  get('greeting').focus();
});
showLetter();

function showStack() {
  get('desk').hidden = true;
  get('mail-desk').hidden = false;
  get('stack-label').textContent = index === letters.length ? 'See your reward' : index > 0 || solved > 0 ? 'Return to the letters' : 'Open the letters';
  get('stack').focus();
}

get('stack').addEventListener('click', () => {
  get('mail-desk').hidden = true;
  get('desk').hidden = false;
  get('greeting').focus();
});
get('put-down').addEventListener('click', showStack);

function resetLetters() {
  index = 0;
  solved = 0;
  get('put-down').hidden = false;
  get('desk').hidden = true;
  get('mail-desk').hidden = false;
  get('stack-label').textContent = 'Open the letters';
  showLetter();
}
