/**
 * Created by ericmanzi on 1/13/16.
 */
var socket = io();

socket.on('move', function(data){
    currentCol=data.col;
    if (data.gameid===gameid && data.player!==player) {
        moveit();
    }
});

var gameField = new Array();
var currentCol;
var currentRow;
var currentPlayer=1;
var player;
var gameid;
var turn;

newgame();

function newgame(){

    var url = window.location.href;
    gameid = getGameId(url);
    var welcome_text = "";
    if (player==1) {
        var gamelink = window.location.href+"?gameid="+gameid;
        welcome_text = 'Your friend can join this game by visiting this link:' +
            ' <input size="35" type="url" value="'+gamelink+'" onfocus="this.select()"/>';
    } else {
        welcome_text = 'You are now in a <emph>live</emph> game session with your friend';
    }
    document.getElementById('welcome-text').innerHTML = welcome_text;

    prepareField();
}

function cellAt(i, j) {
    return document.getElementById("cell"+i+j);
}

function firstFreeRow(col,player){
    for(var i = 0; i<6; i++){
        if(gameField[i][col]!=0){
            break;
        }
    }
    //console.log("i:"+i);
    //console.log("col:"+col);
    gameField[i-1][col] = player;
    return i-1;
}



function moveit() {
    turn=!turn;
    for (a = 5; a >= 0; a--) {
        //console.log("a:"+a);
        //console.log("currentCol:"+currentCol);
        if (!cellAt(a,currentCol).className) {
            makeMove(a, currentCol, 0);
            break;
        }
    }
    setTimeout(function () {
        dropDisc(currentPlayer);
    }, 300);
}


function dropDisc(player){
    currentRow = firstFreeRow(currentCol,player);
    currentPlayer = player;
    checkForMoveVictory();
}

function checkForMoveVictory(){
    if(!checkForVictory(currentRow,currentCol)){
        currentPlayer = 3-currentPlayer;
    } else {
        var p1wins = currentPlayer == 1;
        currentPlayer = 3-currentPlayer;
        var winMessage="";
        if (player===1) {
            winMessage = p1wins ? "Congrats! You win!" : "Sorry, you lose";
        } else {
            winMessage = p1wins ? "Sorry, you lose" : "Congrats! You win!";
        }
        alert(winMessage);
        restart();
    }
}


function prepareField(){
    gameField = new Array();
    for(var i=0; i<6; i++){
        gameField[i] = new Array();
        for(var j=0; j<7; j++){
            gameField[i].push(0);
            a = i;
            b = j;
            var cell = cellAt(a, b);
            cell.className = '';
            cell.onclick = function(b, a) {
                return function() {
                    if (turn) {
                        currentCol = b;
                        moveit();
                        socket.emit('move', { "gameid":gameid, "col":currentCol, "player":player });

                    }
                }
            }(b)

        }
    }
}

function currentColor(player) {
    return player == 1 ? 'Red' : 'Yellow';
}

function isCurrentColor(i, j) {
    //console.log("icc i:"+i);
    //console.log("icc j:"+j);
    return cellAt(i, j).className === currentColor(currentPlayer);
}

function makeMove(i, j, s) {
    s > 0 && (cellAt(s, j).className = '');
    cellAt(s + 1, j).className = currentColor(currentPlayer);
    s === i - 1 ? function (i, j) {
        return function (i, j) {
                for (a = j - 1; 0 < a && isCurrentColor(i, a); a--) {
                }
                for (b = j + 1; 6 > b && isCurrentColor(i, b); b++) {
                }
                return 4 < b - a;
            }(i, j) || function (i, j) {
                for (c = i + 1; 5 > c && isCurrentColor(c, j); c++) {
                }
                return 3 < c - i;
            }(i, j) || function (i, j) {
                for (a = i - 1, b = j - 1; 0 < a && !(1 > b) && isCurrentColor(a, b); a--)
                    b--;
                for (c = i + 1, b = j + 1; 5 > c && !(6 < b) && isCurrentColor(c, b); c++)
                    b++;
                return 4 < c - a
            }(i, j) || function (i, j) {
                for (a = i - 1, b = j + 1; 0 < a && !(6 < b) && isCurrentColor(a, b); a--)
                    b++;
                for (c = i + 1, b = j - 1; 5 > c && !(1 > b) && isCurrentColor(c, b); c++)
                    b--;
                return 4 < c - a;
            }(i, j);
    }(i, j)
        : setTimeout(function () {
        makeMove(i, j, s + 1);
    }, 60);

}

function getAdj(row,col,row_inc,col_inc){

    if(cellVal(row,col) == cellVal(row+row_inc,col+col_inc)){
        return 1+getAdj(row+row_inc,col+col_inc,row_inc,col_inc);
    } else {
        return 0;
    }
}

function cellVal(row,col){
    if(gameField[row] == undefined || gameField[row][col] == undefined){
        return -1;
    } else {
        return gameField[row][col];
    }
}


function checkForVictory(row,col){
    if(getAdj(row,col,0,1)+getAdj(row,col,0,-1) > 2){
        return true;
    } else {
        if(getAdj(row,col,1,0) > 2){
            return true;
        } else {
            if(getAdj(row,col,-1,1)+getAdj(row,col,1,-1) > 2){
                return true;
            } else {
                if(getAdj(row,col,1,1)+getAdj(row,col,-1,-1) > 2){
                    return true;
                } else {
                    return false;
                }
            }
        }
    }
}

function getGameId( url ) {
    if (/\?gameid/.test(url)) {
        player=2;
        turn=false;
        return url.match(/(\=).*/)[0].substring(1)
    } else {
        player=1;
        turn=true;
        return ''+(new Date()).getTime();
    }
}

function restart() {
    location.href="/";
}