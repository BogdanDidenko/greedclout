window.onload = function(){
  function get_token_price(data){
    substr = '$BitClout: ~$';
    start_pos = data.indexOf(substr);
    end_pos = data.slice(start_pos + substr.length).indexOf('USD');
    bitclout_price = parseFloat(data.slice(start_pos + substr.length, start_pos + substr.length + end_pos));
    if (isNaN(bitclout_price)) {
      bitclout_price = 157.90
    }
    $('#price').html('' + bitclout_price);
    return bitclout_price;
  }

  function to_float(_num) {
    var resPrice;
    if (_num.includes('.') == false) {
      resPrice = _num.replace(',', '.')
    } else {
      resPrice = _num.replace(',', '')
    }
    return parseFloat(resPrice)
  }
  function cumpute_expected_token_price(expected_usd_locked, bitclout_price) {
    /**
     * usd_locked = (0.001 * coins_supply**3) * bitclout_price
     * y = 0.001 * x^3 * z
     *
     * x = (10 y^(1/3))/z^(1/3) and z!=0
     * expected_coins_supply = (10 * Math.pow(expected_usd_locked, 1/3)) / Math.pow(bitclout_price, 1/3)
     */
    let expected_coins_supply = (10 * Math.pow(expected_usd_locked, 1/3)) / Math.pow(bitclout_price, 1/3)
    let expected_token_price = .003 * Math.pow(expected_coins_supply, 2) * bitclout_price
    return expected_token_price
  }
  var compute_actions = {
    'buy': (current_token_price, coins_supply, usd_locked, usd_to_buy, bitclout_price)=>{
      let expected_usd_locked = usd_locked + usd_to_buy;
      return [cumpute_expected_token_price(expected_usd_locked, bitclout_price), null];
    },
    'sell': (current_token_price, coins_supply, usd_locked, usd_to_sell, bitclout_price)=>{
      let expected_usd_locked = usd_locked - usd_to_sell;
      if (expected_usd_locked < 0) {
        return [null, "Your can't sell more than accaunt 'Total USD Locked' value. 😉"];
      }
      return [cumpute_expected_token_price(expected_usd_locked, bitclout_price), null];
    },
    'range': (current_token_price, coins_supply, usd_locked, input_value, bitclout_price) => {
      let expected_supply = (10 * Math.sqrt(10/3) * Math.sqrt(input_value)) / (Math.sqrt(bitclout_price))
      let expected_usd_locked = (0.001 * expected_supply**3) * bitclout_price
      return [expected_usd_locked - usd_locked, null];
    }
  }
  // fetch('https://www.bitcloutpulse.com/').then(function(response, body){
    // response.text().then((data)=>{
  data = ''
  var bitclout_price = get_token_price(data)
  // setInterval(()=>{
  //   fetch('https://bitclout.com/', {
  //     mode: 'cors',
  //     headers: {
  //       'Access-Control-Allow-Origin':'*'
  //     }
  //   }).then(function(response, body){
  //     response.text().then((data)=>{
  //       bitclout_price = get_token_price(data)
  //     });
  //   });
  // }, 1000)
  $('.compute').on('click', (e)=>{
    e.stopPropagation();
    e.preventDefault()
    target = e.target;
    action = target.dataset.attrValue;
    // var x1 = 0, x2 = 0, y = 0;
    var current_token_price = 0, coins_supply = 0, usd_locked = 0,
      current_token_price = to_float($('#current_token_price').val() || '0');
    if (current_token_price > 0) {
      coins_supply = (10 * Math.sqrt(10/3) * Math.sqrt(current_token_price)) / (Math.sqrt(bitclout_price));
      usd_locked = (0.001 * coins_supply**3) * bitclout_price;
    }
    input_value = to_float($('#'+ action +'_amount').val());
    if (isNaN(input_value)) {return}
    // debugger
    res = compute_actions[action](current_token_price, coins_supply, usd_locked, input_value, bitclout_price)
    let out_value = res[0], error = res[1];
    if (error != null) {
      alert(error)
      return
    }
    $('#'+action+'_out').val(out_value.toLocaleString() + ' $')
  })
      // var $ = document.getElementById.bind(document)
      // $('compute').onclick = function(){
      //   var x1 = 0, x2 = 0, y = 0;
      //   let current_token_price = to_float($('current_token_price').value)
      //   if (current_token_price > 0) {
      //     let coins_supply = (10 * Math.sqrt(10/3) * Math.sqrt(y)) / (Math.sqrt(bitclout_price))
      //     x1 = (0.001 * coins_supply**3) * bitclout_price
      //   }
      //   y = to_float($('expected_token_price').value)
      //   if (isNaN(y)) {return}
      //   let coins_supply = (10 * Math.sqrt(10/3) * Math.sqrt(y)) / (Math.sqrt(bitclout_price))
      //   x2 = (0.001 * coins_supply**3) * bitclout_price
      //   if (x2 <= x1) {
      //     alert('Expected token price should be larger than Current token price');
      //     return
      //   }

      //   $('out').value =  (x2 - x1).toLocaleString() //+ '$'
      // }
  // })
  // })
}