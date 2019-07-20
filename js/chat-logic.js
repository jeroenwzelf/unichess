(function () {
    var Message;
    Message = function (arg) {
        this.text = arg.text, this.message_side = arg.message_side, this.color = arg.color;
        this.draw = function (_this) {
            return function () {
                var $message;
                $message = $($('.message_template').clone().html());
                $message.addClass(_this.message_side).find('.text').html(_this.text);
                $('.messages').append($message);

                // Add king image
                $message.find('.avatar').prepend(
                	'<img id="profileKingImg" style="height:100%;margin-left:auto;margin-right:auto;display:block;" src="img/chesspieces/wikipedia/' + playerState[_this.color].color + 'K.png" />'
                );

                return setTimeout(function () {
                    return $message.addClass('appeared');
                }, 0);
            };
        }(this);
        return this;
    };
    $(function () {
        var getMessageText, message_side, sendMessage;
        message_side = 'right';
        getMessageText = function () {
            var $message_input;
            $message_input = $('.message_input');
            return $message_input.val();
        };
        sendMessage = function (text, color) {
            var $messages, message;
            if (text.trim() === '') {
                return;
            }
            $('.message_input').val('');
            $messages = $('.messages');

            message_side = playerColor === color ? 'right' : 'left';

            message = new Message({
                text: text,
                message_side: message_side,
                color: color
            });
            message.draw();
            return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
        };
        $('.send_message').click(function (e) {
            return sendMessage(getMessageText(), playerColor);
        });
        $('.message_input').keyup(function (e) {
            if (e.which === 13) {
                return sendMessage(getMessageText(), playerColor);
            }
        });
        clearMessages = function() {
        	$('.messages').empty();
        };

        setTimeout(function () {
            return sendMessage('Hey nigga! How are you?', 0);
        }, 500);
        setTimeout(function () {
            return sendMessage('Hi Sandy! How are you?', 1);
        }, 1000);
        setTimeout(function () {
            return sendMessage('I\'m fine, thank you!', 2);
        }, 1500);
        setTimeout(function () {
            return sendMessage('I\'m fine, thank you!', 3);
        }, 2000);
    });
}.call(this));