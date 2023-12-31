function Mine(tr, td, mineNum) {
    this.tr = tr;
    this.td = td;
    this.mineNum = mineNum;
    this.squares = []
    this.tds = []
    this.surplusMine = mineNum
    this.mainBox = document.querySelector('.gameBox')
}

// 生成随机数
Mine.prototype.randomNum = function () {
    let positionArray = new Array(this.tr * this.td)
    for (let i = 0; i < positionArray.length; i++) {
        positionArray[i] = i
    }

    positionArray.sort(function () {
        return 0.5 - Math.random()
    })
    return positionArray.splice(0, this.mineNum)
}

// 初始化
Mine.prototype.init = function () {
    let positionMine = this.randomNum();
    let n = 0;
    for (let i = 0; i < this.tr; i++) {
        this.squares[i] = [];
        for (var j = 0; j < this.td; j++) {
            if (positionMine.indexOf(n++) != -1) {
                this.squares[i][j] = { type: 'mine', x: j, y: i };
            } else {
                this.squares[i][j] = { type: 'number', x: j, y: i, value: 0 };
            }
        }
    }

    this.mainBox.oncontextmenu = function () {
        return false
    }

    this.updateNum()
    this.createDom()

    this.mineNumDom = document.querySelector('.mineNum')
    this.surplusMine = this.mineNum
    this.mineNumDom.innerHTML = this.surplusMine


}


Mine.prototype.createDom = function () {
    let This = this;
    let table = document.createElement('table')
    for (let i = 0; i < this.tr; i++) {
        let domTr = document.createElement('tr')
        this.tds[i] = []
        for (let j = 0; j < this.td; j++) {
            let domTd = document.createElement('td')
            domTd.pos = [i, j]
            domTd.onmousedown = function () {
                This.play(event, this)
            }
            this.tds[i][j] = domTd;
            domTr.appendChild(domTd)
        }
        table.appendChild(domTr)
    }
    this.mainBox.innerHTML = '';
    this.mainBox.appendChild(table)
}

Mine.prototype.getAround = function (positionArray) {
    let x = positionArray.x;
    let y = positionArray.y
    let result = []
    for (let i = x - 1; i < x + 1; i++) {
        for (let j = y - 1; j < i + 1; j++) {
            if (
                i < 0 ||
                j < 0 ||
                i > this.td - 1 ||
                j > this.tr - 1 ||
                (i == x && j == y || this.squares[j][i].type == 'mine')
            ) {
                continue
            }
            result.push([j, i])
        }
    }

    return result
}

// 更新数字
Mine.prototype.updateNum = function () {
    for (var i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            // 只需要更新雷周围的数字
            if (this.squares[i][j].type == 'number') {
                continue;
            }
            var num = this.getAround(this.squares[i][j]);
            for (var k = 0; k < num.length; k++) {
                // 如果数字周围有雷就加1
                this.squares[num[k][0]][num[k][1]].value += 1;
            }
        }
    }
}


Mine.prototype.play = function (ev, obj) {
    var This = this; // 获取实例对象

    // 点击的是左键 which=1是左键，2是中间的滚轮，3是右键
    if (ev.which == 1 && obj.className != 'flag') {

        var curSquare = this.squares[obj.pos[0]][obj.pos[1]];
        // 各个数字对应的样式
        var cl = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];

        // 点击的是数字
        if (curSquare.type == 'number') {
            obj.innerHTML = curSquare.value;
            obj.className = cl[curSquare.value];

            // 点到数字可以分成两种，0和非0
            // 1.点到了数字0
            if (curSquare.value == 0) {
                obj.innerHTML = ''; // 将0的数字样式不显示0

                function getAllZero(positionArray) {
                    // 获取周围的格子信息
                    var around = This.getAround(positionArray);

                    // 利用递归思想，使周围格子0不显示，直至不是0停止
                    for (var i = 0; i < around.length; i++) {
                        // around[i]=[0,0]
                        var x = around[i][0];
                        var y = around[i][1];

                        This.tds[x][y].className = cl[This.squares[x][y].value];

                        // 若依然为0
                        if (This.squares[x][y].value == 0) {
                            // 递归
                            if (!This.tds[x][y].check) {
                                This.tds[x][y].check = true;

                                getAllZero(This.squares[x][y]);
                            }
                        } else {
                            // 不为0则继续显示数字
                            This.tds[x][y].innerHTML = This.squares[x][y].value;
                        }
                    }
                }

                getAllZero(curSquare);

            }
        } else {
            // 点击的是雷，直接判断游戏结束
            this.gameOver(obj);
        }
    }
    // which=3，鼠标点击的是右键
    if (ev.which == 3) {
        if (obj.className && obj.className != 'flag') {
            return;
        }
        obj.className = obj.className == 'flag' ? '' : 'flag';

        // 处理剩余的雷数
        // if (this.squares[obj.pos[0]][obj.pos[1]].type == 'mine') {
        //     this.allRight = true;
        // } else {
        //     this.allRight = false;
        // }
        if (obj.className == 'flag') {
            this.mineNumDom.innerHTML = --this.surplusMine;
        } else {
            this.mineNumDom.innerHTML = ++this.surplusMine;
        }

        if (this.surplusMine == 0) {
            for (var i = 0; i < this.tr; i++) {
                for (var j = 0; j < this.td; j++) {
                    if (this.tds[i][j].className == 'flag') {
                        if (this.squares[i][j].type != 'mine') {
                            this.gameOver();
                            return;
                        }
                    }
                }
            }
            alert("恭喜你成功扫雷！");
            this.init();
        }
    }

};

// 游戏结束方法gameover
Mine.prototype.gameOver = function (clickTd) {
    // 1.显示所有的雷
    // 2.取消所有格子的点击事件
    // 3.给点中的雷标上红

    for (var i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            if (this.squares[i][j].type == 'mine') {
                this.tds[i][j].className = 'mine';
            }
            this.tds[i][j].onmousedown = null;
        }
    }

    if (clickTd) {
        clickTd.className = 'redMine';
    }
};

// 按钮的功能
let btns = document.querySelectorAll('.level button');
var mine = null;

var btnKey = 0; // 等级的索引

// 初级，中级，高级的难度设置
var headerArr = [
    [9, 9, 10], [16, 16, 40], [28, 28, 99]
];

for (let i = 0; i < btns.length - 1; i++) {
    btns[i].onclick = function () {

        // 清除之前点击的样式
        btns[btnKey].className = '';
        this.className = 'active';

        mine = new Mine(...headerArr[i]);
        mine.init();

        // 更新状态
        btnKey = i;
    }
}

// 页面一开始就是初级扫雷
btns[0].onclick();
btns[3].onclick = function () {
    mine.init();
}
