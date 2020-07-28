/*global console, jQuery, window, document, Table*/

(function (window, document, $) {
  "use strict";

  function onClickResults() {
    $('#predictionResultsLevel, #predictionResultsTime')
      .not(this)
      .find('input[type="radio"]')
        .attr('checked', false)
        .removeAttr('checked')
        .end()
      .find('input[type="number"]')
        .val('');
    $(this).find('[type="radio"]').attr('checked', true);
  }

  function validateForm($form) {
    var expRate,
      currentLevel,
      hoursPerDay;

    //console.log($form);
    expRate = parseFloat($('#expPerSecond').val());
    if (typeof expRate != 'number' || expRate <= 0) {
      return {
        result: false,
        message: 'Experience rate should be a number above zero.',
      };
    }

    currentLevel = parseFloat($('#currentLevel').val());
    if (typeof currentLevel != 'number' || currentLevel <= 0 || currentLevel > 800) {
      return {
        result: false,
        message: 'Current level should be a positive number, lower than 800.',
      };
    }

    hoursPerDay = parseFloat($('#hoursPerDay').val());
    if (typeof hoursPerDay != 'number' || hoursPerDay <= 0 || hoursPerDay > 24) {
      hoursPerDay = 24;
    }

    return {
      result: true,
      expRate: expRate,
      currentLevel: currentLevel,
      hoursPerDay: hoursPerDay,
    }
  }

  function onClickCalculate() {
    var values,
      level = 0,
      time = 0,
      result;

    values = validateForm($(this).parents('form'));
    if (values.result == false) {
      alert(values.message);
      return;
    }

    //console.log('form', values);
    if ($('#predictionResultsLevel').find('[type="radio"]:checked').length) {
      level = isFloat($('#resultLevel').val(), 400);

      if (level < values.currentLevel) {
        alert('Target level can\'t be lower than current level.');
        return;
      }
      //console.log('level', level);
      result = Table.levelPredictionTime(
        values.expRate,
        values.currentLevel,
        values.hoursPerDay,
        level
      );
      $('#resultTimeDays').val(Math.floor(result));
      $('#resultTimeHours').val(((result - Math.floor(result)) * 24).toFixed(2));
    } else {
      time = isFloat($('#resultTimeDays').val(), 0);
      time += isFloat($('#resultTimeHours').val(), 0) / 24;
      console.log('time', time);
      result = Table.levelPredictionLevel(
        values.expRate,
        values.currentLevel,
        values.hoursPerDay,
        time
      );
      $('#resultLevel').val(result);
    }
  }

  function isFloat(value, default_value) {
    value = parseFloat(value);
    if (typeof value !== 'number' || value !== Number(value)) {
      return default_value
    }
    return value;
  }

  function main (data, status) {
    //console.log('Main');
    if (status == 'success') {
      // Enable calculation button when script is loaded.
      $('#predictionCalculation').removeAttr('disabled');
      // Clear results on change.
      $('#predictionResultsLevel, #predictionResultsTime')
        .once('predCalc1')
        .on('click', onClickResults);
      // Calculate.
      $('#predictionCalculation')
        .once('predCalc2')
        .on('click', onClickCalculate);
    }
  }

  $(window).ready(function() {
    $.getScript('../js/table.js', main);
  });

}(window, document, jQuery));
