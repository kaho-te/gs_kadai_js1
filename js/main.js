let q_chord = [];
let ary = [];
let code_name;
let count = 0;
let success_count = 0;
let bonus_count = 0;
let carrot_count = 0;

const key = ['A3','A#3','B3','C4','C#4','D4','D#4','E4','F4','F#4','G4','G#4','A4','A#4','B4','C5','C#5','D5','D#5','E5'];
const doremi = {C:'ド',D:'レ',E:'ミ',F:'ファ',G:'ソ',A:'ラ',B:'シ'};
// ボーナスメロディの音階データ
const melody_dataA = [
  'D4',['F#4',null,null,'G4'],['A4','D4'],['F#4','A4'],'G4',['B4',null,null,'C#5'],['D5','G4'],['B4','D5'],
  ['A4','D5'],['B4','A4'],['G4','F#4'],['D4','E4'],['F#4','D4'],['E4','C#4'],'D4','D5'
];
const melody_dataB = [
  'A3',['D4',null,null,'E4'],'F#4',null,'D4',['G4',null,null,'A4'],'B4',null,
  'F#4','G4','D4',null,'A3','A3','F#3','A4'
];
const melody_dataC = [
  'F#3','A3','D4',null,'B3','G3','B3',null,
  'F#3','F#3','G3','B3','C#3','E3','F#3','F#4'
];
const bass_data = [
  'D3','F#3','A3',null,'G2','D3','G3',null,
  'D3','A3','E3','G3','A3','C#4','D3','D4'
];

//正解不正解時の効果音
const fail = [[null,'C4','B3','A3'],['G3',null,null,null]];
const maru = [[null,'E5','C5',null]];

$(document).ready(function(){
  //デフォルトで表示する要素を指定
  $('.start_view').show();
  $('.game_view').hide();
  $(".start").on("click",function(){
    question();
    $('.start_view').slideUp('slow');
    $('.game_view').slideDown('slow');
  });
});

//ヒントのコード名を表示
$(".chord").on("click",function(){
  $(".chord_text").html(code_name);
})

//キーボードを鳴らす
$("#keyboard li").on("click",function(){
  let sound = $(this).data('id');
  let sound_name;
  // 音源の「Tone.Synth()」を作り、マスター出力に接続
  let synth = new Tone.Synth().toMaster();
  // 中央の「ド(C4)」を4分音符で発音する
  synth.triggerAttackRelease(sound, '4n');
  ary.push(sound);
  sound_name = doremi[sound.slice(0, 1)];
  if(sound.length == 3) {
    sound_name = sound_name + "#";
  }
  $(".input").append(sound_name + " ");
})

//次の問題
$(".next").on("click",function(){
  question();
})

//決定ボタンで回答する
$(".answer").on("click",function(){
  //チャレンジした回数を増やして表示
  count += 1;
  $(".challenge span").html(count);
  //問題の音の数と回答した音の数があっているか
  if(ary.length != q_chord.length){
    mistake();
    return;
  }
  //問題の音と回答した音があっているか（順不同）
  for(let i=0; i<ary.length; i++){
    let same = false;
    for(let j=0; j<q_chord.length; j++){
      if(ary[i] == q_chord[j]){
        same = true;
      }
    }
    if(same == false){
      mistake();
      return;
    }
    if(same == true && i == ary.length-1){
      success();
    }
  }
  ary = [];
  $(".input").html("");
})

//もう一回同じ問題音を鳴らす
$(".more").on("click",function(){
  $(".input").html("");
  ary = [];
  let synth = new Tone.PolySynth().toMaster();
  Tone.Transport.bpm.value = 120;
  synth.triggerAttackRelease(q_chord, '4n');
  $(".chord_text").html("？").css('font-size','40px');
  $(".rabit_img").animate({top:"-20px"}, 400).animate({top:"0px"}, 400);
});

//ボーナス人参からメロディを鳴らす
$(".carrot_img").on("click",function(){
  play_music();
})

//回答した音の確認
$(".check").on("click",function(){
  let synth = new Tone.PolySynth().toMaster();
  synth.triggerAttackRelease(ary, '4n');
});

function mistake() {
  //誤りの時の効果音を鳴らして、メッセージ表示
  addEffect();
  playEffect(fail);
  $(".chord_text").html("ざんねん！");
  $(".rabit_img").animate({ opacity: 1 }, {
    duration: 1700,
    step: function (now) {
      $(this).css({ transform: 'rotate(' + now * -20 + 'deg)' })
    }
  }).animate({ opacity: 1 }, {
    duration: 700,
    step: function (now) {
      $(this).css({ transform: 'rotate(' + now * 0 + 'deg)' })
    }
  });
  bonus_count = 0;
}

function success() {
  //正解の時の効果音を鳴らして、メッセージ表示
  addEffect();
  playEffect(maru);
  $(".chord_text").html("当たり！");
  $(".rabit_img").animate({top:"-20px"}, 200).animate({top:"0px"}, 200);
  $(".rabit_img").animate({top:"-20px"}, 200).animate({top:"0px"}, 200);
  success_count += 1;
  bonus_count += 1;
  $(".point span").html(success_count);
  if(bonus_count >= 5){
    carrot_count += 1;
    if(carrot_count == 4) {
      $(".chord_text").html("にんじんを全部" + "<br>" + "ゲットしたよ").css('font-size','24px');
      bonus_count = 0;
    } else if (carrot_count > 4){
      $(".chord_text").html(bonus_count + "問連続正解だよ" + "<br>" + "天才！").css('font-size','24px');
    }
    else {
      $(".chord_text").html("にんじんを" + "<br>" + "ゲットしたよ").css('font-size','24px');
      bonus_count = 0;
    }
  }
  $(".carrot_list li:nth-child(-n+"+carrot_count+")").css("visibility","visible");
}

function question() {
  ary = [];
  q_chord = [];
  $(".chord_text").html("").css('font-size','40px');
  $(".input").html("");

  const num = Math.random(); //小数点の乱数を生成
  const r   = Math.floor(num * 12); //繰り上げ
  
  let mode = $('input[name="mode"]:checked').val();
  q_chord.push(key[r]);
  if (mode == "harmony") {
    //randomで取得した音に対してメジャーコードの和音を追加する
    //和音２つ目
    q_chord.push(key[r+4]);
    //和音３つ目
    q_chord.push(key[r+7]);
  }
  $(".chord_text").html("？");
  $(".rabit_img").animate({top:"-20px"}, 400).animate({top:"0px"}, 400);
  let synth = new Tone.PolySynth().toMaster();
  Tone.Transport.bpm.value = 120;
  synth.triggerAttackRelease(q_chord, '4n');
  code_name = key[r].slice(0,-1);

}


function addMelodyA(time, note) {
  let melody_synthA = new Tone.PolySynth().toMaster();
  melody_synthA.triggerAttackRelease(note, '8n', time);

}

function addMelodyB(time,note) {
  let melody_synthB = new Tone.PolySynth().toMaster();
  melody_synthB.triggerAttackRelease(note, '8n', time);

}

function addMelodyC(time,note) {
  let melody_synthC = new Tone.PolySynth().toMaster();
  melody_synthC.triggerAttackRelease(note, '8n', time);

}

function addBass(time, note) {
  let bass_synth = new Tone.PolySynth().toMaster();
  bass_synth.triggerAttackRelease(note, '8n', time);

}

function addEffect(time,note) {
  let effect_synth = new Tone.PolySynth().toMaster();
  effect_synth.triggerAttackRelease(note, '8n', time);
}

function play_music() {
  //獲得した人参の数に合わせて重ねる音数を設定
  if(carrot_count >= 4) {
    let melody_a = new Tone.Sequence(addMelodyA, melody_dataA).start();
    melody_a.loop = false;
  }
  if(carrot_count >= 3) {
    let melody_b = new Tone.Sequence(addMelodyB, melody_dataB).start();
    melody_b.loop = false;
  }
  if(carrot_count >= 2) {
    let melody_c = new Tone.Sequence(addMelodyC, melody_dataC).start();
    melody_c.loop = false;
  }
  if(carrot_count >= 1) {
    let bass = new Tone.Sequence(addBass, bass_data).start();
    bass.loop = false;
  }

  // テンポを指定
  Tone.Transport.bpm.value = 120;
  Tone.Transport.start();
  for(let i=0; i<8; i++){
    $(".rabit_img").animate({top:"-20px"}, 470).animate({top:"0px"}, 470);
  }
}

function playEffect(effect_sound) {
  let melody_effect = new Tone.Sequence(addMelodyA, effect_sound).start();
  melody_effect.loop = false;
  Tone.Transport.bpm.value = 200;
  Tone.Transport.start();
}