let cur_date;

const train_data = {
    '2021-4-19': [
        { title: '硬拉', weight: 200, group: 3, count: 3, note: '注意节奏' },
        { title: '深蹲', weight: 180, group: 3, count: 3, note: '核心收紧' },
        { title: '卧推', weight: 120, group: 3, count: 3, note: '收紧背部' },
        { title: '杠铃划船', weight: 100, group: 5, count: 10, note: '' },
        { title: '高位下拉', weight: 95, group: 5, count: 5, note: '' },
    ],
};

const breakfast_data = {
    '2021-4-19': [
        { title: '豆腐', weight: 50, energy: 10 },
        { title: '米饭', weight: 100, energy: 100 },
    ],
};
const lunch_data = {
    '2021-4-19': [
        { title: '苹果', weight: 20, energy: 20 },
        { title: '蛋花汤', weight: 50, energy: 80 },
    ],
};
const dinner_data = {
    '2021-4-19': [
        { title: '草莓', weight: 20, energy: 40 },
        { title: '牛肉', weight: 50, energy: 200 },
    ],
};

const video_data = [
    { vid: 0, title: '一起晒太阳', length: 114 },
    { vid: 1, title: '卧推教程一', length: 1919 },
    { vid: 2, title: '卧推教程二', length: 514 },
    { vid: 3, title: '硬拉', length: 123 },
    { vid: 4, title: '深蹲', length: 1111 },
    { vid: 5, title: '肩推', length: 7777 },
    { vid: 6, title: '高位下拉', length: 810 },
];

const favor_data = [0, 1, 5];

const alarm_data = [
    { hour: 6, min: 45, day: [1, 2, 3, 4, 5], rep: 3, inr: 5, enable: true },
    { hour: 8, min: 10, day: [0, 6], rep: 3, inr: 5, enable: false },
];

const watch_picker = new Picker(document.querySelector('.js-inline-picker'), {
    format: 'mm:ss',
    date: '00:00',
    inline: true,
});

const alarm_picker = new Picker(document.querySelector('#alarm-edit-picker'), {
    format: 'HH:mm',
    inline: true,
});

document
    .querySelector('.js-inline-picker')
    .addEventListener('pick', (event) => {
        console.log(event);
    });

// tool functions
function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (
            c ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16)
    );
}

function clear_collapse() {
    $('.control-buttons.show').removeClass('show');
}

function item_collapse(ele) {
    const $btn = $(ele);
    const $sib = $btn.siblings();
    $('.control-buttons.show').not($sib).removeClass('show');
    $sib.toggleClass('show');
}

function get_index(ele) {
    return $(ele).parents('.item-wrap').first().index();
}

function get_meal_page(return_selector = false) {
    const idx = $('#meal-switch-bar').find('.selected').index();
    if (return_selector) {
        switch (idx) {
            case 0:
                return '#breakfast-list';
            case 1:
                return '#lunch-list';
            case 2:
                return '#dinner-list';
        }
    }
    return idx;
}

function del_confirm(callback) {
    $('#delAlartModal').modal('show');

    $('#delAlartModal .ok').off().on('click', function() {
        $('#delAlartModal').modal('hide');
        callback(true);
    });

    $('#delAlartModal .cancel').off().on('click', function() {
        $('#delAlartModal').modal('hide');
        callback(false);
    });
}

function del_train_click(ele) {
    del_confirm(function(confirm) {
        if (confirm) {
            const $btn = $(ele);
            const idx = get_index(ele);
            $btn.parents('.item-wrap').first().remove();
            train_data[cur_date].splice(idx, 1);
        }
    });
}

function del_meal_click(ele) {
    del_confirm(function(confirm) {
        if (confirm) {
            const $btn = $(ele);
            const idx = get_index(ele);
            const $parent = $btn.parents('.item-wrap').first();

            const text = $parent.find('.card-text').text().split(' ')[1];
            const this_energy = text.substring(0, text.length - 2);

            const $total = $parent
                .parents('.item-list')
                .first()
                .prev()
                .find('span');
            $total.text($total.text() - this_energy);

            $parent.remove();

            switch (get_meal_page(true)) {
                case '#breakfast-list':
                    breakfast_data[cur_date].splice(idx, 1);
                    break;
                case '#lunch-list':
                    lunch_data[cur_date].splice(idx, 1);
                    break;
                case '#dinner-list':
                    dinner_data[cur_date].splice(idx, 1);
                    break;
            }
        }
    });
}

function del_alarm_click(ele) {
    del_confirm(function(confirm) {
        if (confirm) {
            const $btn = $(ele);
            const idx = get_index(ele);
            $btn.parents('.item-wrap').first().remove();
            alarm_data.splice(idx, 1);
        }
    });
}

function set_train_item({ title, weight = 0, group = 0, count = 0, note = '' } = {},
    idx = undefined
) {
    const $block = $(`
        <div type="button" class="col-12 card mt-3 train-item">
            <div class="card-body">
                <h5 class="card-title">${title}</h5>
            </div>
        </div>
        <div class="col-auto ml-auto mr-3 control-buttons">
            <div class="row">
                <div type="button" class="edit-button col mr-4">
                    <i class="bi bi-pencil-square"></i>
                </div>
                <div type="button" class="del-button col">
                    <i class="bi bi-trash"></i>
                </div>
            </div>
        </div>
    `);

    const $content = $block.find('.card-body');
    if (weight !== 0 || (group !== 0 && count !== 0)) {
        $content.append(
                $(
                    `<p class="card-text">${weight !== 0 ? weight + '千克' : ''} 
                ${group !== 0 && count !== 0 ? `${group}组x${count}个` : ''
                }</p>`
            )
        );
    }

    if (note !== '') {
        $content.append($(`<p class="card-text small">${note}</p>`));
    }

    $block.first().on('click', function (e) {
        item_collapse(this);
    });

    $block.find('.del-button').on('click', function (e) {
        del_train_click(this);
    });

    $block.find('.edit-button').on('click', function (e) {
        const idx = get_index(this);
        const $container = $('#editTrainModal');

        $container.find('form')[0].reset();

        $('#input-train-ok').data('idx', idx);

        const data = train_data[cur_date][idx];

        $container.find('[name=title]').val(data.title);
        $container.find('[name=note]').val(data.note);

        if ('weight' in data) {
            $('#input-weight-checkbox').trigger('click');
            $container.find('[name=weight]').val(data.weight);
        }

        if ('group' in data) {
            $('#input-number-checkbox').trigger('click');
            $container.find('[name=group]').val(data.group);
            $container.find('[name=count]').val(data.count);
        }

        $container.modal('show');
    });

    let $row;
    if (idx === undefined) {
        $row = $('<div class="row item-wrap">').appendTo($('#train-list'));
    } else {
        $row = $('#train-list').children().eq(idx);
        $row.html('');
    }

    $row.append($block);
}

function set_meal_item(
    { title, weight, energy },
    container = undefined,
    idx = undefined
) {
    if (container === undefined) {
        container = get_meal_page(true);
    }

    const $block = $(`
        <div class="col-12 card mt-3 meal-item">
            <div class="card-body">
                <h5 class="card-title">${title}</h5>
                <p class="card-text">${weight}克 ${energy}千焦</p>
            </div>
        </div>
        <div class="col-auto ml-auto mr-3 control-buttons">
            <div class="row">
                <div type="button" class="edit-button col mr-4">
                    <i class="bi bi-pencil-square"></i>
                </div>
                <div type="button" class="del-button col">
                    <i class="bi bi-trash"></i>
                </div>
            </div>
        </div>
    `);

    $block.first().on('click', function (e) {
        item_collapse(this);
    });

    $block.find('.del-button').on('click', function (e) {
        del_meal_click(this);
    });

    $block.find('.edit-button').on('click', function (e) {
        const idx = get_index(this);
        const $container = $('#editMealModal');

        $container.find('form')[0].reset();

        $('#input-meal-ok').data('idx', idx);

        let data;
        switch (get_meal_page()) {
            case 0:
                data = breakfast_data[cur_date][idx];
                break;
            case 1:
                data = lunch_data[cur_date][idx];
                break;
            case 2:
                data = dinner_data[cur_date][idx];
                break;
        }

        $container.find('[name=title]').val(data.title);
        $container.find('[name=weight]').val(data.weight);
        $container.find('[name=energy]').val(data.energy);

        $container.modal('show');
    });

    let $row;
    let old_energy;
    if (idx === undefined) {
        $row = $('<div class="row item-wrap">').appendTo($(container));
        old_energy = 0;
    } else {
        $row = $(container).children().eq(idx);
        const text = $row.find('.card-text').text().split(' ')[1];
        old_energy = text.substring(0, text.length - 2);
        $row.html('');
    }

    const $total = $(container).prev().find('span');
    $total.text($total.text() - old_energy + energy);

    $row.append($block);
}

function set_alarm_item(
    { hour, min, day, rep, inr, enable } = {},
    idx = undefined
) {
    const uuid = uuidv4();

    const $block = $(`
        <div class="card col-12 mt-3 alarm-item">
            <div class="alarm-item-info card-body">
                <div class="row">
                    <div class="col">
                        <div class="alarm-time">${hour}:${min}</div>
                        <div class="alarm-days small"></div>
                    </div>
                    <div class="col-auto">
                        <div class="custom-control custom-switch">
                            <input type="checkbox" class="custom-control-input" id="${uuid}"${enable ? 'checked' : ''
        }>
                            <label class="custom-control-label" for="${uuid}"></label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-auto ml-auto mr-3 control-buttons">
            <div class="row">
                <div type="button" class="edit-button col mr-4">
                    <i class="bi bi-pencil-square"></i>
                </div>
                <div type="button" class="del-button col">
                    <i class="bi bi-trash"></i>
                </div>
            </div>
        </div>
    `);

    const $content = $block.find('.alarm-days');
    const day_dict = {
        0: '周日',
        1: '周一',
        2: '周二',
        3: '周三',
        4: '周四',
        5: '周五',
        6: '周六',
    };
    $content.text(
        day
            .map((ele) => {
                return day_dict[ele];
            })
            .join('、')
    );

    $block.first().on('click', function (e) {
        item_collapse(this);
    });

    $block.find('input').on('change', function (e) {
        const idx = get_index(this);

        alarm_data[idx].enable = $(this).prop('checked');
    });

    $block.find('.del-button').on('click', function (e) {
        del_alarm_click(this);
    });

    $block.find('.edit-button').on('click', function (e) {
        const idx = get_index(this);
        const $container = $('#editAlarmModal');

        $container.find('form')[0].reset();

        $('#input-alarm-ok').data('idx', idx);

        const data = alarm_data[idx];

        alarm_picker.setDate(
            alarm_picker.parseDate(`${data.hour}:${data.min}`)
        );

        $container.find('[name=rep]').val(data.rep);
        $container.find('[name=inr]').val(data.inr);

        const $checkbox_list = $container.find('.form-row input');
        data.day.forEach((ele) => {
            $checkbox_list.eq(ele).prop('checked', true);
        });

        $container.modal('show');
    });

    let $row;
    if (idx === undefined) {
        $row = $('<div class="row item-wrap">').appendTo($('#alarm-list'));
    } else {
        $row = $('#alarm-list').children().eq(idx);
        $row.html('');
    }

    $row.append($block);
}

function set_video_item({ vid, title, length }) {
    const min = Math.floor(length / 60);

    const sec = length % 60;

    const $block = $(`
        <div type="button" class="row result-item mt-3" data-vid="${vid}">
            <div class="col-auto">
                <img class="thumbnail">
            </div>
            <div class="col mx-2">
                <span>
                    ${title}
                    <br>
                    <small>${min > 0 ? min + '分' : ''}${sec}秒</small>
                </span>
            </div>
        </div>
    `);

    $block.on('click', () => {
        $('#favorite-button').data('vid', vid);
        $('#favorite-button').removeClass('stared');
        if (favor_data.includes(vid)) {
            $('#favorite-button').addClass('stared');
        }
        $('#explain-title>h3').text(title);
        // $('#search-page').hide();
        $('#video-page').show();
    });

    $('#search-result-list').append($block);
}

function load_proj_data(date) {
    const $train_list = $('#train-list');
    const $breakfast_list = $('#breakfast-list');
    const $lunch_list = $('#lunch-list');
    const $dinner_list = $('#dinner-list');

    $('.total-energy span').text('0')

    $train_list.html('');
    $breakfast_list.html('');
    $lunch_list.html('');
    $dinner_list.html('');

    if (train_data[date]) {
        train_data[date].forEach((ele) => {
            set_train_item(ele);
        });
    }

    if (breakfast_data[date]) {
        breakfast_data[date].forEach((ele) => {
            set_meal_item(ele, '#breakfast-list');
        });
    }

    if (lunch_data[date]) {
        lunch_data[date].forEach((ele) => {
            set_meal_item(ele, '#lunch-list');
        });
    }

    if (dinner_data[date]) {
        dinner_data[date].forEach((ele) => {
            set_meal_item(ele, '#dinner-list');
        });
    }
}

function update_my_favor() {
    $('#favorite-list').html('');

    video_data
        .filter((ele) => {
            return favor_data.includes(ele.vid);
        })
        .forEach((ele) => {
            const min = Math.floor(ele.length / 60);
            const sec = ele.length % 60;

            const $block = $(`
                <div class="row my-2">
                    <div class="col-auto">
                        <img>
                    </div>
                    <div class="col mx-2">
                        <span>
                            ${ele.title}
                            <br>
                            <small>${min > 0 ? min + '分' : ''}${sec}秒</small>
                        </span>
                    </div>
                    <div class="my-favorite-button col-auto stared" data-vid="${ele.vid
                }">
                        <i class="bi bi-star video-star"></i>
                        <i class="bi bi-star-fill video-stared"></i>
                    </div>
                </div>
            `);

            $block.find('.my-favorite-button').on('click', function (e) {
                const $self = $(this);
                const vid = $self.data('vid');
                if ($self.hasClass('stared')) {
                    favor_data.splice(favor_data.indexOf(vid), 1);
                } else {
                    favor_data.push(vid);
                }
                $self.toggleClass('stared');

                e.stopPropagation()
            });

            $block.on('click', () => {
                $('#favorite-button').data('vid', ele.vid);
                $('#favorite-button').removeClass('stared');
                if (favor_data.includes(ele.vid)) {
                    $('#favorite-button').addClass('stared');
                }
                $('#explain-title>h3').text(ele.title);
                // $('#search-page').hide();
                $('#video-page').show();
            })

            $('#favorite-list').append($block);
        });
}

// page switch
function meal_page_switch(page = 0) {
    clear_collapse();

    switch (page) {
        case 0:
            $('#breakfast-body').show();
            $('#lunch-body').hide();
            $('#dinner-body').hide();

            $('#meal-switch-bar .selected').removeClass('selected');
            $('#breakfast-page-btn').addClass('selected');
            break;
        case 1:
            $('#breakfast-body').hide();
            $('#lunch-body').show();
            $('#dinner-body').hide();

            $('#meal-switch-bar .selected').removeClass('selected');
            $('#lunch-page-btn').addClass('selected');
            break;
        case 2:
            $('#breakfast-body').hide();
            $('#lunch-body').hide();
            $('#dinner-body').show();

            $('#meal-switch-bar .selected').removeClass('selected');
            $('#dinner-page-btn').addClass('selected');
            break;
    }
}

function train_meal_switch(page = 0) {
    clear_collapse();

    if (page === 0 && $('#meal-page-btn').hasClass('selected')) {
        // show train
        $('#meal-body').hide();
        $('#train-body').show();
        // $('#train-body').show().scrollTop(0);

        $('#train-page-btn').addClass('selected');
        $('#meal-page-btn').removeClass('selected');
    } else if (page === 1 && $('#train-page-btn').hasClass('selected')) {
        // show meal
        meal_page_switch();

        $('#train-body').hide();
        $('#meal-body').show();
        // $('#meal-body').show().scrollTop(0);

        $('#meal-page-btn').addClass('selected');
        $('#train-page-btn').removeClass('selected');
    }
}

function clock_watch_switch(page = 0) {
    clear_collapse();

    if (page === 0 && $('#stopwatch-page-btn').hasClass('selected')) {
        // show clock
        $('#stopwatch-body').hide();
        $('#alarm-body').show().scrollTop(0);

        $('#alarm-page-btn').addClass('selected');
        $('#stopwatch-page-btn').removeClass('selected');
    } else if (page === 1 && $('#alarm-page-btn').hasClass('selected')) {
        // show watch
        meal_page_switch();

        $('#alarm-body').hide();
        $('#stopwatch-body').show().scrollTop(0);

        $('#stopwatch-page-btn').addClass('selected');
        $('#alarm-page-btn').removeClass('selected');
    }
}

// one time init

$(function load_alarm() {
    const $alarm_list = $('#alarm-list');

    $alarm_list.html('');

    alarm_data.forEach((ele) => {
        set_alarm_item(ele);
    });
});

$(function load_video() {
    const $alarm_list = $('#search-result-list');

    $alarm_list.html('');

    video_data.forEach((ele) => {
        set_video_item(ele);
    });
});

$('#bottom-bar>div').on('click', function (e) {
    const $btn = $(this);
    if ($btn.hasClass('selected')) {
        return;
    }
    const page = $btn.data('page');
    $('#bottom-bar>div').removeClass('selected');
    $btn.addClass('selected');
    const $pages = $(
        '#sched-page, #search-page, #clock-page, #user-page, #video-page'
    );
    $pages.hide();
    $(page).show();
    switch (page) {
        case '#sched-page':
            // train_meal_switch();
            break;
        case '#search-page':
            // $('#input-search').val('');
            // $('#search-button').trigger('click');
            break;
        case '#clock-page':
            // clock_watch_switch();
            break;
        case '#user-page':
            update_my_favor();
            break;
    }
});

$('#sched-switch-bar')
    .children()
    .on('click', function (e) {
        const $btn = $(this);
        const idx = $btn.index();
        train_meal_switch(idx);
    });

$('#meal-switch-bar')
    .children()
    .on('click', function (e) {
        const $btn = $(this);
        const idx = $btn.index();
        meal_page_switch(idx);
    });

$('#clock-switch-bar')
    .children()
    .on('click', function (e) {
        const $btn = $(this);
        const idx = $btn.index();
        clock_watch_switch(idx);
    });

$('#input-weight-checkbox').on('change', function (e) {
    $('#input-weight').prop(
        'disabled',
        !$('#input-weight-checkbox').prop('checked')
    );
});

$('#input-number-checkbox').on('change', function (e) {
    $('.input-number').prop(
        'disabled',
        !$('#input-number-checkbox').prop('checked')
    );
});

$('#add-train-button>i').on('click', () => {
    $('#editTrainModal').find('form')[0].reset();
    $('#input-train-ok').removeData('idx');

    $('#editTrainModal').modal('show');
});

$('#add-meal-button>i').on('click', () => {
    $('#editMealModal').find('form')[0].reset();
    $('#input-meal-ok').removeData('idx');

    $('#editMealModal').modal('show');
});

$('#add-alarm-button>i').on('click', () => {
    $('#editAlarmModal').find('form')[0].reset();
    $('#input-alarm-ok').removeData('idx');
    alarm_picker.setDate(new Date());

    $('#editAlarmModal').modal('show');
});

function array_to_dict(total, ele) {
    if (
        ['weight', 'group', 'count', 'energy', 'rep', 'inr'].includes(ele.name)
    ) {
        total[`${ele.name}`] = ele.value - 0;
    } else {
        total[`${ele.name}`] = ele.value;
    }
    return total;
}

function set_data(container, data, idx = undefined, date = cur_date) {
    if (idx === undefined) {
        if (!(date in container)) {
            container[date] = [data];
        } else {
            container[date].push(data);
        }
    } else {
        container[date][idx] = data;
    }
}

$('#input-train-ok').on('click', () => {
    const $form = $('#editTrainModal').find('form');

    if (!$form[0].reportValidity()) {
        return;
    }

    const idx = $('#input-train-ok').data('idx');

    const data = $form.serializeArray().reduce(array_to_dict, {});

    set_train_item(data, idx);
    set_data(train_data, data, idx);

    $('#input-train-ok').removeData('idx');

    $('#editTrainModal').modal('hide');
});

$('#input-meal-ok').on('click', () => {
    const $form = $('#editMealModal').find('form');

    if (!$form[0].reportValidity()) {
        return;
    }

    const idx = $('#input-meal-ok').data('idx');

    const data = $form.serializeArray().reduce(array_to_dict, {});

    set_meal_item(data, undefined, idx);

    switch (get_meal_page()) {
        case 0:
            set_data(breakfast_data, data, idx);
            break;
        case 1:
            set_data(lunch_data, data, idx);
            break;
        case 2:
            set_data(dinner_data, data, idx);
            break;
    }

    $('#input-meal-ok').removeData('idx');

    $('#editMealModal').modal('hide');
});

$('#input-alarm-ok').on('click', () => {
    const $form = $('#editAlarmModal').find('form');

    if (!$form[0].reportValidity()) {
        return;
    }

    const idx = $('#input-alarm-ok').data('idx');

    const data = $form.serializeArray().reduce(array_to_dict, {});
    data.hour = alarm_picker.getDate().getHours();
    data.min = alarm_picker.getDate().getMinutes();
    data.day = $form
        .find('.form-row')
        .find('input:checked')
        .toArray()
        .map((ele) => {
            return $(ele).index('#editAlarmModal .form-row input');
        });
    data.enable = true;

    set_alarm_item(data, idx);

    if (idx === undefined) {
        alarm_data.push(data);
    } else {
        alarm_data[idx] = data;
    }

    $('#input-alarm-ok').removeData('idx');

    $('#editAlarmModal').modal('hide');
});

$(function timer_picker_update_event() {
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutationRecord) {
            let picked_time=watch_picker.getDate(true);
            $('#stopwatch-display').text(picked_time);
            let m=picked_time.split(':')[0];
            let s=picked_time.split(':')[1];
            //console.log(m+' '+s);
            if(m=='00'&&s=='00'){
                // console.log(111);
                $('#timer-reset-button').prop('class','disabled');
                $('#timer-toggle-button').prop('class','pause disabled');
            }else{
                $('#timer-reset-button').prop('class','');
                $('#timer-toggle-button').prop('class','pause');
            }
        });
    });

    const $targets = $('.js-inline-picker .picker-list');
    $targets.toArray().forEach((ele) => {
        observer.observe(ele, { childList: true });
    });
});

let timer;

function start_timer(time) {
    let m = time.split(':')[0];
    let s = time.split(':')[1];

    function countDown() {
        s--;
        s < 10 && (s = '0' + s);
        if (s.length >= 3) {
            s = 59;
            m--;
            m < 10 && (m = '0' + m);
        }
        if (m.length >= 3) {
            m = '00';
            s = '00';
            clearInterval(timer);

            $('#timer-toggle-button').trigger('click');
            $('#timer-reset-button').trigger('click');
            $('#timer-alert').show();
        }
        $('#stopwatch-display').text(`${m}:${s}`);
    }
    timer = setInterval(countDown, 1000);
}

$('#timer-toggle-button').on('click', () => {
    const $self = $('#timer-toggle-button');
    if($self.hasClass('disabled')){
        return;
    }
    if ($self.hasClass('pause')) {
        const $edit = $('#stopwatch-edit');
        if ($edit.hasClass('show')) {
            $edit.removeClass('show');
            const time = watch_picker.getDate(true);
            $('#stopwatch-display').text(time);
            start_timer(time);
        } else {
            start_timer($('#stopwatch-display').text());
        }
    } else {
        clearInterval(timer);
    }

    // $('#timer-reset-button').toggleClass('disabled');
    $self.toggleClass('pause');
    $('#timer-alert').hide();
});

$('#timer-reset-button').on('click', () => {
    if ($('#timer-reset-button').hasClass('disabled')) {
        return;
    }

    clearInterval(timer);
    $('#stopwatch-display').text('00:00');
    watch_picker.setDate(watch_picker.parseDate('00:00'));
    $('timer-toggle-button').prop('class','pause');
    $('#stopwatch-edit').addClass('show');
    $('#timer-alert').hide();
});

$('#timer-alert button').on('click', () => {
    $('#timer-alert').hide();
})

$('#video-back-btn').on('click', () => {
    $('#favorite-button').removeClass('stared');
    // $('#search-page').show();
    $('#video-page').hide();

    update_my_favor()
});

$('#favorite-button').on('click', function (e) {
    const $self = $(this);
    const vid = $self.data('vid');
    if ($self.hasClass('stared')) {
        favor_data.splice(favor_data.indexOf(vid), 1);
    } else {
        favor_data.push(vid);
    }
    $self.toggleClass('stared');
});

$('#search-button').on('click', () => {
    $('#search-result-list').html('');

    const word = $('#input-search').val();

    video_data
        .filter((ele) => {
            return ele.title.indexOf(word) !== -1;
        })
        .forEach((ele) => {
            set_video_item(ele);
        });
});

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? factory(require('jquery'))
        : typeof define === 'function' && define.amd
            ? define(['jquery'], factory)
            : factory(global.jQuery);
})(this, function ($) {
    'use strict';

    $.fn.datepicker.languages['zh-CN'] = {
        format: 'yyyy年mm月dd日',
        days: [
            '星期日',
            '星期一',
            '星期二',
            '星期三',
            '星期四',
            '星期五',
            '星期六',
        ],
        daysShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        daysMin: ['日', '一', '二', '三', '四', '五', '六'],
        months: [
            '一月',
            '二月',
            '三月',
            '四月',
            '五月',
            '六月',
            '七月',
            '八月',
            '九月',
            '十月',
            '十一月',
            '十二月',
        ],
        monthsShort: [
            '1月',
            '2月',
            '3月',
            '4月',
            '5月',
            '6月',
            '7月',
            '8月',
            '9月',
            '10月',
            '11月',
            '12月',
        ],
        weekStart: 1,
        yearFirst: true,
        yearSuffix: '年',
    };
});

$(() => {
    $('[data-toggle="datepicker"]').datepicker({
        autoHide: true,
        language: 'zh-CN',
        format: 'm月d日',
    });

    $('[data-toggle="datepicker"]').on('pick.datepicker', function (e) {
        const $head = $('#head-date');

        $head.text(
            $('[data-toggle="datepicker"]').datepicker('formatDate', e.date)
        );

        cur_date = `${e.date.getFullYear()}-${e.date.getMonth() + 1
            }-${e.date.getDate()}`;

        load_proj_data(cur_date);
    });

    $('[data-toggle="datepicker"]').datepicker(
        'setDate',
        new Date(2021, 3, 19)
    );
});