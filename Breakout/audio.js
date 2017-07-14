/**
 * Created by Tyler on 7/14/2017.
 */

var path = 'assets/sound/';
var audio = document.getElementById("audiotag");

/**
 * Allows for simplicity of sound retrieving.
 *
 * @param a
 */
function playAudio(a) {
    var audio = path + a;
    var sound = new Audio(audio);
    sound.play();
}

function playMusic() {
    audio.play();
}

function stopMusic() {
    audio.pause();
}