/*global console, window*/

window.Table = (function () {
  'use strict';

  var calc = {};

  // Constants ============================================================= //

  calc.normalMaxLevel = 400;
  calc.masterMaxLevel = 820;
  calc.skillMaxLevel = 1200;

  calc.normalTable = getTable('normal');
  calc.masterTable = getTable('master');

  // Public functions ====================================================== //

  //
  calc.totalExp = function (level) {
    var exp = 0,
      levelDetails = getLevelDetails(level),
      masterLevel = 0;

    log('totalExp arg', level);
    if (levelDetails.lvl > this.normalMaxLevel) {
      exp += this.normalTable[this.normalMaxLevel].total;
      exp += this.masterTable[levelDetails.master].total;
      exp += this.masterTable[levelDetails.master].exp * levelDetails.bar;
    } else {
      exp += this.normalTable[levelDetails.lvl].total;
      exp += this.normalTable[levelDetails.lvl].exp * levelDetails.bar;
    }
    log('totalExp ret', round(exp));
    return round(exp);
  }

  //
  calc.levelOnXp = function (exp) {
    var masterExp = 0,
      residualExp = 0,
      residualLevel = 0,
      result,
      i = 0;

    log('levelOnXp arg', exp);
    if (exp > this.normalTable[this.normalMaxLevel].total) {
      masterExp = exp - this.normalTable[this.normalMaxLevel].total;
      for (i = 0; i <= this.masterMaxLevel; i += 1) {
        if (this.masterTable[i].total > masterExp) {
          residualExp = masterExp - this.masterTable[i - 1].total;
          residualLevel = residualExp / this.masterTable[i - 1].exp;
          result = round(this.masterTable[i - 1].level + this.normalMaxLevel + residualLevel);
          log('levelOnXp log', [residualExp, residualLevel]);
          log('levelOnXp ret', result);
          return result;
        }
      }
    } else {
      for (i = 0; i <= this.normalMaxLevel; i += 1) {
        if (this.normalTable[i].total > exp) {
          result = round(this.normalTable[i - 1].level);
          log('levelOnXp ret', result);
          return result;
        }
      }
    }
    log('levelOnXp ret', 'error');
    return 0;
  }

  //
  calc.expToLevel = function (currentLevel, level) {
    var result;
    log('expToLevel arg', [currentLevel, level]);
    log('expToLevel log', [this.totalExp(level), this.totalExp(currentLevel)]);
    result = round(
      this.totalExp(level) - this.totalExp(currentLevel)
    );
    log('expToLevel ret', result);
    return result;
  }

  //
  calc.levelPredictionTime = function (expRate, currentLevel, hoursDay, level) {
    var neededExp = this.totalExp(level) - this.totalExp(currentLevel),
      dailyExp = (expRate * 60 * 60) * hoursDay,
      result = round(neededExp/dailyExp, 0);

    log('levelPredictionTime arg', [expRate, currentLevel, hoursDay, level]);
    log('levelPredictionTime log', [neededExp, dailyExp]);
    log('levelPredictionTime ret', result);
    return round(neededExp/dailyExp, 0);
  }

  //
  calc.levelPredictionLevel = function (expRate, currentLevel, hoursDay, time) {
    var expTime = (parseInt(expRate) * 60 * 60 * parseFloat(hoursDay)) * parseFloat(time),
      currentExp = parseInt(this.totalExp(currentLevel)),
      result = this.levelOnXp(currentExp + expTime);

    log('levelPredictionLevel arg', [expRate, currentLevel, hoursDay, time]);
    log('levelPredictionLevel log', [expTime, currentExp]);
    log('levelPredictionLevel ret', result);
    return result;
  }

  // Private functions ===================================================== //

  function getTable(type) {
    var table = [1,2,3];
    $.ajaxSetup({async: false});
    $.getJSON('../tables/' + type + '.json', function (data) {
      if (data) {
        table = data;
      }
    });
    $.ajaxSetup({async: true});
    log('getTable', type);
    return table;
  };

  function getLevelDetails(level) {
    return {
      lvl: Math.floor(level),
      master: (level > calc.normalMaxLevel) ?
        Math.floor(level) - calc.normalMaxLevel : 0,
      bar: round(level - Math.floor(level))
    };
  }

  function round(number, fixed) {
    fixed = fixed | 2;
    return number.toFixed(fixed);
  }

  function log(label, message) {
    //console.log('Table', label, message);
  }

  return calc;
}());
