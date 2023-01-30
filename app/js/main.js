//Imports
import { $, $$ } from '@sciter';
import * as sys from '@sys';
import { encode, decode } from '@sciter';

adjustWindow();

//Window adjust function for fullscreen and such
function adjustWindow() {
  const [sw, sh] = Window.this.screenBox('frame', 'dimension');
  const w = sw / 2;
  const h = sh / 2;
  Window.this.move((sw - w) / 2, (sh - h) / 2, w, h, true);
  $('#canvas').attributes.width = w + 'px';
  $('#canvas').attributes.height = h + 'px';
}

//Base write function
async function write() {
  while ($('#canvas').lastChild) {
    $('#canvas').lastChild.remove();
  }
  const text = $('#string').value;
  const style = +$('#style').value;
  const legibility = +$('#legibility').value;
  const speed = +$('#speed').value + 200;
  const width = +$('#thickness').value;
  $('#string').state.disabled = true;
  $('#write').classList.add('disabled');
  const result = await _write(
    text,
    style,
    legibility,
    speed,
    width,
    +$('#canvas').attributes.width.replace('px', ''),
    +$('#canvas').attributes.height.replace('px', ''),
    callback
  );
  $('#string').state.disabled = false;
  $('#write').classList.remove('disabled');
}

//Save file
$('#save').on('click', () => {
  let filename = Window.this.selectFile('save');
  if (filename === null) return;
  filename = filename.replace('file://', '');
  sys.fs.open(filename, "w+", 0o666).then((file) => {
    const html = $('#canvas').outerHTML;
    const buffer = encode(html, 'utf-8');
    file.write(buffer);
    file.close();
  });
});

//Write on enter
$('#string').on('keyup', function (evt) {
  if (evt.keyCode === 13) write();
});

//Write on click
$('#write').on('click', function () {
  !this.classList.contains('disabled') && write();
});

//Function variable?
let mustRemove = false;

function callback(d) {
  //Regex, statement for removal
  d = d.replace(/\n/g, '');
  if (d === 'REMOVE LAST PATH') {
    mustRemove = true;
  } else {
    if (mustRemove) {
      $('#canvas').lastChild.remove();
      mustRemove = false;
    }
    //SVG generation
    $('#canvas').innerHTML += `<path d="${d}" stroke="black" stroke-width="1" fill="black"></path>`;
  }
}

//Write function
function _write(
  text,
  style,
  legibility,
  speed,
  width,
  canvas_width,
  canvas_height,
  callback
) {
  return new Promise((resolve) => {
    Window.this.xcall(
      'write',
      text,
      style,
      legibility,
      speed,
      width,
      canvas_width,
      canvas_height,
      callback,
      resolve
    );
  });
}

//If F1 Key is pressed, send to about
document.addEventListener('keyup', ({ code }) => {
  if (code === 'KeyF1') {
    Window.this.modal({
      url: 'about/about.html'
    });
  }
});