function changeTdToInputAndSelect(id, valueInput) {
    $.ajax({
        type: 'GET',
        url: 'UserManager/GetAccessRoles',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (accessRoles) {

            let inputId = `#user-${id}`;
            let selectId = `#drop-down-user-${id}`;
            let tdButtonsId = `#buttons-${id}`;

            var $input = $('<input>', {
                value: valueInput,
                type: 'text',
                id: `input-edit-user-${id}`
            });

            var option = `<select id="select-role-${id}">`;

            $.each(accessRoles, function (i, accessRole) {
                option += `<option value="${accessRole.id}" name="${accessRole.role}">${accessRole.role}</option>`;
            });
            option += `</select>`;

            var $select = $(option);

            var $newButton = $('<button>', {
                id: "update-btn-" + id,
                name: "Update",
                onclick: `editUser(${id}, "#select-role-${id}")`
            });

            var $i = document.createElement("i");
            $i.innerHTML = '<iconify-icon icon="ic:baseline-check-circle-outline" style="color: #00a300;" width="27" height="27"></iconify-icon>';
            $newButton.append($i);

            var $tdInput = $(inputId);
            var $tdSelect = $(selectId);
            var $tdButtons = $(tdButtonsId);

            $input.appendTo($tdInput.empty());
            $select.appendTo($tdSelect.empty());
            $newButton.appendTo($tdButtons.empty());
        }
    });
}

function getEditAndDeleteButtons(id, username) {
    // Create Edit button
    let $aEdit = $(`<a>`, {
        id: `edit-user-${id}`,
        onclick: `changeTdToInputAndSelect(${id}, "${username}")`,
        class: "edit",
        "data-toggle": "modal"
    });

    let $iEdit = document.createElement("i");
    $iEdit.innerHTML = '<iconify-icon icon="eva:edit-outline" width="27" height="27"></iconify-icon>';

    $aEdit.append($iEdit);


    // Create delete button
    let $formDelete = $("<form>", {
        id: `delete-user-${id}`,
        onsubmit: "return jQueryAjaxDelete(this)",
        action: `UserManager/DeleteUser/${id}`,
        method: "post"
    });

    let $bDelete = $("<button>", {
        type: "submit",
        class: "delete",
        "data-toggle": "modal",
    });

    let $iDelete = document.createElement("i");
    let $iconfyDelete = `<iconify-icon icon="mingcute:delete-2-line" width="25" height="25"></iconify-icon>`;

    $iDelete.innerHTML = $iconfyDelete;
    $bDelete.append($iDelete);
    $formDelete.append($bDelete);

    return [$aEdit, $formDelete];
}

function getTr(user) {
    let $tr = $('<tr>', {
        id: `tr-${user.id}`
    });

    // Username
    let $tdUsername = $('<td>', {
        id: `user-${user.id}`,
        text: user.username
    });

    $tr.append($tdUsername);

    // Access role
    let $tdAccessRole = $('<td>', {
        id: `drop-down-user-${user.id}`,
        text: user.accessRole
    });

    $tr.append($tdAccessRole);

    let $tdButtons = $('<td>', {
        id: `buttons-${user.id}`
    });

    $tdButtons.append(getEditAndDeleteButtons(user.id, user.username));

    $tr.append($tdButtons);

    return $tr
}

// ------------------------------------------------------AJAX-------------------------------------------------------------------


// Add user
jQueryAjaxAdd = form => {
    try {
        $.ajax({
            type: 'POST',
            url: form.action,
            data: new FormData(form),
            contentType: false,
            processData: false,
            success: function (response) {
                if (response.success) {
                    let $tbody = $("#tblUsers");
                    $tbody.append(getTr(response.user));
                }
                else {
                    alert(`${response.errorMessage}`);
                }
                
            },
            error: function (err) {
                console.log(err)
            }
        })
        //to prevent default form submit event
        return false;
    } catch (ex) {
        console.log(ex)
    }
}

// Edit User
function editUser(id, selectId) {
    var inputId = `#input-edit-user-${id}`;
    var formData = new FormData();

    formData.append("id", id);
    formData.append("username", document.querySelector(inputId).value);
    formData.append("accessRoleId", $(selectId + " option:selected").val());

    $.ajax({
        type: 'PUT',
        url: 'UserManager/EditUser',
        contentType: false,
        processData: false,
        cache: false,
        data: formData,
        success: function (user) {
            editUserWorker(id, user)
        }
    });
}

function editUserWorker(id, user) {
    let tdUsernameId = `#user-${id}`;
    let tdAccessRoleId = `#drop-down-user-${id}`;
    let tdButtonsId = `#buttons-${id}`;

    let $aEdit, $formDelete = getEditAndDeleteButtons(id, user.username);

    // Create td colum
    var $tdUsername = $(tdUsernameId);
    var $tdAccessRole = $(tdAccessRoleId);
    var $tdButtons = $(tdButtonsId);

    $tdUsername.empty();
    document.getElementById(`user-${id}`).innerHTML = user.username;
    $tdAccessRole.empty();
    document.getElementById(`drop-down-user-${id}`).innerHTML = user.accessRole;
    $tdButtons.empty()
    $tdButtons.append($aEdit);
    $tdButtons.append($formDelete);
}

jQueryAjaxDelete = form => {
    if (confirm('Are you sure to delete this record ?')) {
        try {
            $.ajax({
                type: 'DELETE',
                url: form.action,
                data: new FormData(form),
                contentType: false,
                processData: false,
                success: function (result) {
                    if (result.editUser)
                    {
                        editUserWorker(result.data.id, result.data)
                        $(`table tr#tr-${result.deleteId}`).remove();
                    }
                    else
                    {
                        $(`table tr#tr-${result.id}`).remove();
                    }
                    
                },
                error: function (err) {
                    console.log(err)
                }
            });
        } catch (ex) {
            console.log(ex)
        }
    }
    //prevent default form submit event
    return false;
}

$(function () {
    $("#search-username").keyup(function () {
        GetUsers();
    });
});

function GetUsers() {
    var username = $.trim($("#search-username").val());
    var tbody = $("#tblUsers");
    tbody.html("");
    $.ajax({
        type: "POST",
        url: "/UserManager/SearchUsers?username=" + username,
        data: "{username:'" + username + "'}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (users) {
            $.each(users, function (i, user) {
                tbody.append(getTr(user));;
            });
        }
    });
}
