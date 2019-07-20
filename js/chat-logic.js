function Message(arg) {
	this.text = arg.text, this.message_side = arg.message_side, this.color = arg.color, this.avatar = arg.avatar;
	this.draw = function (_this) {
		return function () {
			var $message;
			$message = $($('.message_template').clone().html());
			$message.addClass(_this.message_side).find('.text').html(_this.text);
			$('.messages').append($message);

			$message.addClass('color' + _this.color);

			// Add king image
			if (_this.avatar) {
				$message.find('.avatar').prepend(
					'<img id="profileKingImg" style="height:100%;margin-left:auto;margin-right:auto;display:block;" src="img/chesspieces/wikipedia/' + playerState[_this.color].color + 'K.png" />'
				);
			}

			return setTimeout(function () {
				return $message.addClass('appeared');
			}, 0);
		};
	}(this);
	return this;
};

var getMessageText, message_side, sendMessage;
message_side = 'right';

function getMessageText() {
	var $message_input;
	$message_input = $('.message_input');
	return $message_input.val();
};

function sendMessage(text, color) {
	var $messages, message;
	if (text.trim() === '') {
		return;
	}
	$('.message_input').val('');
	$messages = $('.messages');

	message_side = getPlayerByColor(playerColor) === color ? 'right' : 'left';

	message = new Message({
		text: text,
		message_side: message_side,
		color: color,
		avatar: !$messages.children().last().hasClass('color' + color)	// if previous message is sent by the same player, don't use the avatar again
	});
	message.draw();
	websocket_sendChat(text);
	return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
};

function clearMessages() {
	$('.messages').empty();
};