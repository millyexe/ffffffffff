var currentPlaylist = [];
var shufflePlaylist = [];
var tempPlaylist = [];
var audioElement;
var mouseDown = false;
var currentIndex = 0;
var repeat = false;
var shuffle = false;
var userLoggedIn;
var timer;

$(document).click(function(click) {
	var target = $(click.target);

	if(!target.hasClass("item") && !target.hasClass("optionsButton")) {
		hideOptionsMenu();
	}
});

$(window).scroll(function() {
	hideOptionsMenu();
});

$(document).on("change", "select.playlist", function() {
	var select = $(this);
	var playlistId = select.val();
	var songId = select.prev(".songId").val();

	$.post("includes/handlers/ajax/addToPlaylist.php", { playlistId: playlistId, songId: songId})
	.done(function(error) {

		if(error != "") {
			alert(error);
			return;
		}

		hideOptionsMenu();
		select.val("");
	});
});


function updateEmail(emailClass) {
	var emailValue = $("." + emailClass).val();

	$.post("includes/handlers/ajax/updateEmail.php", { email: emailValue, username: userLoggedIn})
	.done(function(response) {
		$("." + emailClass).nextAll(".message").text(response);
	})


}

function updatePassword(oldPasswordClass, newPasswordClass1, newPasswordClass2) {
	var oldPassword = $("." + oldPasswordClass).val();
	var newPassword1 = $("." + newPasswordClass1).val();
	var newPassword2 = $("." + newPasswordClass2).val();

	$.post("includes/handlers/ajax/updatePassword.php", 
		{ oldPassword: oldPassword,
			newPassword1: newPassword1,
			newPassword2: newPassword2, 
			username: userLoggedIn})

	.done(function(response) {
		$("." + oldPasswordClass).nextAll(".message").text(response);
	})


}

function logout() {
	$.post("includes/handlers/ajax/logout.php", function() {
		location.reload();
	});
}

function openPage(url) {

	if(timer != null) {
		clearTimeout(timer);
	}

	if(url.indexOf("?") == -1) {
		url = url + "?";
	}

	var encodedUrl = encodeURI(url + "&userLoggedIn=" + userLoggedIn);
	$("#mainContent").load(encodedUrl);
	$("body").scrollTop(0);
	history.pushState(null, null, url);
}

function removeFromPlaylist(button, playlistId) {
	var songId = $(button).prevAll(".songId").val();

	$.post("includes/handlers/ajax/removeFromPlaylist.php", { playlistId: playlistId, songId: songId })
	.done(function(error) {

		if(error != "") {
			alert(error);
			return;
		}

		//do something when ajax returns
		openPage("playlist.php?id=" + playlistId);
	});
}

function createPlaylist() {

	var popup = prompt("Please enter the name of your playlist");

	if(popup != null) {

		$.post("includes/handlers/ajax/createPlaylist.php", { name: popup, username: userLoggedIn })
		.done(function(error) {

			if(error != "") {
				alert(error);
				return;
			}

			//do something when ajax returns
			openPage("yourMusic.php");
		});

	}

}

function deletePlaylist(playlistId) {
	var prompt = confirm("Are you sure you want to delte this playlist?");

	if(prompt == true) {

		$.post("includes/handlers/ajax/deletePlaylist.php", { playlistId: playlistId })
		.done(function(error) {

			if(error != "") {
				alert(error);
				return;
			}

			//do something when ajax returns
			openPage("yourMusic.php");
		});


	}
}

function hideOptionsMenu() {
	var menu = $(".optionsMenu");
	if(menu.css("display") != "none") {
		menu.css("display", "none");
	}
}

function showOptionsMenu(button) {
	var songId = $(button).prevAll(".songId").val();
	var menu = $(".optionsMenu");
	var menuWidth = menu.width();
	menu.find(".songId").val(songId);

	var scrollTop = $(window).scrollTop(); //Distance from top of window to top of document
	var elementOffset = $(button).offset().top; //Distance from top of document

	var top = elementOffset - scrollTop;
	var left = $(button).position().left;

	menu.css({ "top": top + "px", "left": left - menuWidth + "px", "display": "inline" });

}


function formatTime(seconds) {
	var time = Math.round(seconds);
	var minutes = Math.floor(time / 60); //Rounds down
	var seconds = time - (minutes * 60);

	var extraZero = (seconds < 10) ? "0" : "";

	return minutes + ":" + extraZero + seconds;
}

function updateTimeProgressBar(audio) {
	$(".progressTime.current").text(formatTime(audio.currentTime));
	$(".progressTime.remaining").text(formatTime(audio.duration - audio.currentTime));

	var progress = audio.currentTime / audio.duration * 100;
	$(".playbackBar .progress").css("width", progress + "%");
}

function updateVolumeProgressBar(audio) {
	var volume = audio.volume * 100;
	$(".volumeBar .progress").css("width", volume + "%");
}

function playFirstSong() {
	setTrack(tempPlaylist[0], tempPlaylist, true);
}

function Audio() {

	this.currentlyPlaying;
	this.audio = document.createElement('audio');

	this.audio.addEventListener("ended", function() {
		nextSong();
	});

	this.audio.addEventListener("canplay", function() {
		//'this' refers to the object that the event was called on
		var duration = formatTime(this.duration);
		$(".progressTime.remaining").text(duration);
	});

	this.audio.addEventListener("timeupdate", function(){
		if(this.duration) {
			updateTimeProgressBar(this);
		}
	});

	this.audio.addEventListener("volumechange", function() {
		updateVolumeProgressBar(this);
	});

	this.setTrack = function(track) {
		this.currentlyPlaying = track;
		this.audio.src = track.path;
	}

	this.play = function() {
		this.audio.play();
	}

	this.pause = function() {
		this.audio.pause();
	}

	this.setTime = function(seconds) {
		this.audio.currentTime = seconds;
	}

}

var phrases = [
    "Believe in yourself and all that you are.",
    "You are capable of amazing things.",
    "The only limit is your imagination.",
    "Believe in the power of your dreams and watch them come true.",
    "You have the strength within you to overcome any challenge.",
    "Embrace the journey, for it is where you will find your true purpose.",
    "Every day is a new opportunity to create the life you envision.",
    "Your perseverance and determination will lead you to great success.",
    "Let your passion guide you on the path to fulfillment and happiness.",
    "You possess the ability to make a positive impact on the world around you.",
    "Challenges are stepping stones to growth and self-discovery.",
    "Your unique talents and abilities have the power to inspire others.",
    "In the face of adversity, remember that you are stronger than you think.",
    "You deserve boundless happiness that knows no limits.",
    "Embrace the joy that you truly deserve with open arms.",
    "Believe in your worthiness of unwavering happiness and let it fill your life.",
    "You are deserving of radiant happiness that shines from within.",
    "Celebrate the fact that you deserve an abundance of happiness and fulfillment.",
    "Embrace the happiness that is rightfully yours and let it guide your journey.",
    "Remember that you are deserving of happiness in every aspect of your life.",
    "You are worthy of happiness that transcends all boundaries and limitations.",
    "As you recognize your own worth, you unlock the door to lasting happiness.",
    "You are loved.",
    "Embrace the love within yourself and watch it radiate into the world around you.",
    "You are deserving of your own love and care, just as much as anyone else.",
    "Celebrate the unique and beautiful individual that you are, and love yourself unconditionally.",
    "Cherish your own heart and soul, for you are worthy of your own love and affection.",
    "In the journey of self-discovery, learn to love every part of yourself, both light and dark.",
    "Your love for yourself is a powerful force that can heal, transform, and inspire.",
    "Nurture a deep and genuine love for yourself, and let it be the foundation of your happiness.",
    "Treasure the person you are becoming and shower yourself with love every step of the way.",
    "Your self-love is a beacon of light that attracts positivity, growth, and genuine connections.",
    "Embrace self-love as an act of courage, and watch it ignite a beautiful transformation within you.",
    "You deserve to be happy.",
    // Add more phrases
  ];

  function getRandomPhrase() {
    var randomIndex = Math.floor(Math.random() * phrases.length);
    return phrases[randomIndex];
  }
  
  window.onload = function () {
    var phraseElement = document.querySelector(".inspirationalPhrase");
    phraseElement.innerHTML = getRandomPhrase();
  };
  