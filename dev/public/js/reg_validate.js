$(document).on('click', '.log_in_button',function () {
    $('#firstname').css('border-color', '');
    $('#secondname').css('border-color', '');
    $('#mail').css('border-color', '');
    $('#phone').css('border-color', '');
    $('#pas').css('border-color', '');

    var firstname = $('#firstname').val();
    var secondname = $('#secondname').val();
    var mail = $('#mail').val().toLowerCase();
    var phone = $('#phone').val();
    var pas = $('#pas').val();

    if(firstname.length == 0)
    {
        notyf.alert('Введите имя!');
        $('#firstname').css('border-color', 'red');
        return;
    }

    if(secondname.length == 0)
    {
        notyf.alert('Введите фамилию!');
        $('#secondname').css('border-color', 'red');
        return;
    }

    var mailStatus = ValidateEmail(mail);
    if(mailStatus == false)
        return;

    if(phone.length == 0)
    {
        notyf.alert('Введите номер телефона!');
        $('#phone').css('border-color', 'red');
        return;
    }else
    {
        if(!(/^(\s*)?(\+)?([- _():=+]?\d[- _():=+]?){7,14}(\s*)?$/.test(phone)))
        {
            notyf.alert('Введите правильный номер телефона!');
            return;
        }
    }

    if(pas.length == 0)
    {
        notyf.alert('Введите пароль!');
        $('#pas').css('border-color', 'red');
        return;
    } else {
        if(checkPassword(pas) == 'Простой')
        {
            notyf.alert('Придумайте более сложный пароль!');
            $('#pas').css('border-color', 'red');
            return;
        }
    }

    $.ajax({
        url: '/reg_query',
        type: 'POST',
        data: ({firstname: firstname, secondname: secondname, mail: mail, phone:phone, pas: pas}),
        dataType: 'json',
        success: function funcSuc(data) {
            var notyf = new Notyf({
                delay:4000,
                alertIcon: 'fa fa-exclamation-circle',
                confirmIcon: 'fa fa-check-circle'
            });

            if(data['response'] == 201)
                location.reload();
            else
            if(data['response'] == 409)
            {
                notyf.alert('Некорректная пара логин/пароль');
            }
            else
            {
                notyf.alert('Что-то пошло не так! Попробуйте позже еще раз! Если ничего не помогает, то свяжитесь со службой поддержки');
            }
        }
    });
});


function ValidateEmail(mail)
{
    if(mail.length == 0)
    {
        notyf.alert('Email не может быть пустым!');
        $('#mail').css('border-color', 'red');
        return false
    }
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
    {
        return (true)
    }
    notyf.alert('Введите корректный Email!');
    $('#mail').css('border-color', 'red');
    return (false)
}

function checkPassword(password) {
    var s_letters = "qwertyuiopasdfghjklzxcvbnm"; // Буквы в нижнем регистре
    var b_letters = "QWERTYUIOPLKJHGFDSAZXCVBNM"; // Буквы в верхнем регистре
    var digits = "0123456789"; // Цифры
    var specials = "!@#$%^&*()_-+=\|/.,:;[]{}"; // Спецсимволы
    var is_s = false; // Есть ли в пароле буквы в нижнем регистре
    var is_b = false; // Есть ли в пароле буквы в верхнем регистре
    var is_d = false; // Есть ли в пароле цифры
    var is_sp = false; // Есть ли в пароле спецсимволы
    for (var i = 0; i < password.length; i++) {
        /* Проверяем каждый символ пароля на принадлежность к тому или иному типу */
        if (!is_s && s_letters.indexOf(password[i]) != -1) is_s = true;
        else if (!is_b && b_letters.indexOf(password[i]) != -1) is_b = true;
        else if (!is_d && digits.indexOf(password[i]) != -1) is_d = true;
        else if (!is_sp && specials.indexOf(password[i]) != -1) is_sp = true;
    }
    var rating = 0;
    var text = "";
    if (is_s) rating++; // Если в пароле есть символы в нижнем регистре, то увеличиваем рейтинг сложности
    if (is_b) rating++; // Если в пароле есть символы в верхнем регистре, то увеличиваем рейтинг сложности
    if (is_d) rating++; // Если в пароле есть цифры, то увеличиваем рейтинг сложности
    if (is_sp) rating++; // Если в пароле есть спецсимволы, то увеличиваем рейтинг сложности
    /* Далее идёт анализ длины пароля и полученного рейтинга, и на основании этого готовится текстовое описание сложности пароля */
    if (password.length < 6 && rating < 3) text = "Простой";
    else if (password.length < 6 && rating >= 3) text = "Средний";
    else if (password.length >= 8 && rating < 3) text = "Средний";
    else if (password.length >= 8 && rating >= 3) text = "Сложный";
    else if (password.length >= 6 && rating == 1) text = "Простой";
    else if (password.length >= 6 && rating > 1 && rating < 4) text = "Средний";
    else if (password.length >= 6 && rating == 4) text = "Сложный";
    return text; // Форму не отправляем
}