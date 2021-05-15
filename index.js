window.onload = function(){
  var bitclout_price = 153.45
  var get_price_api = 'https://api.cloutcompare.com/bitclout/price'

  function get_token_price(data){
    data = JSON.parse(data)
    let _bitclout_price = data.data.bitclout_price.bitclout_bitcoin_exchange_rate * data.data.bitclout_price.bitcoin_usd_exchange_rate
    // substr = '$BitClout: ~$';
    // start_pos = data.indexOf(substr);
    // end_pos = data.slice(start_pos + substr.length).indexOf('USD');
    // bitclout_price = parseFloat(data.slice(start_pos + substr.length, start_pos + substr.length + end_pos));
    // if (isNaN(bitclout_price)) {
    //   bitclout_price = 157.90
    // }
    $('#price').html('' + _bitclout_price.toLocaleString());
    return _bitclout_price;
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

  function main() {
    $('.compute').on('click', (e)=>{
      e.stopPropagation();
      e.preventDefault()
      target = e.target;
      action = target.dataset.attrValue;
      // var x1 = 0, x2 = 0, y = 0;
      var current_token_price = 0, coins_supply = 0, usd_locked = 0,
        current_token_price = to_float($('#current_token_price').val() || '0'),
        founder_reward = to_float($('#founder_reward').val() || '0');

      if (current_token_price > 0) {
        coins_supply = (10 * Math.sqrt(10/3) * Math.sqrt(current_token_price)) / (Math.sqrt(bitclout_price));
        usd_locked = (0.001 * coins_supply**3) * bitclout_price;
      }
      input_value = to_float($('#'+ action +'_amount').val());
      if (isNaN(input_value) || isNaN(founder_reward)) {return}
      if (action == 'buy') {
        input_value *= (1 - (founder_reward / 100));
      }
      if (action == 'range') {
        if (founder_reward === 100) {
          $('#'+action+'_out').val('infinity $')
          return;
        }
        input_value = current_token_price + ((input_value - current_token_price) * (1 / (1 - (founder_reward / 100)))); //(input_value * (founder_reward / 100))
      }
      // debugger
      res = compute_actions[action](current_token_price, coins_supply, usd_locked, input_value, bitclout_price)
      let out_value = res[0], error = res[1];
      if (error != null) {
        alert(error)
        return
      }
      $('#'+action+'_out').val(out_value.toLocaleString() + ' $')
    })
  }

  fetch(get_price_api).then(function(response, body){
    response.text().then((data)=>{
      bitclout_price = get_token_price(data)
      setInterval(()=>{
        fetch(get_price_api).then(function(response, body){
          response.text().then((data)=>{
            bitclout_price = get_token_price(data)
          });
        });
      }, 10000)
      main()
    })
  }).catch((error) => {
    $('#price').html('' + bitclout_price);
    main();
    console.log('Current price doesn\'t find');
  });
}