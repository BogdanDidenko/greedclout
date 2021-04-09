function get_token_price(data){
  substr = '$BitClout: ~$'
  start_pos = data.indexOf(substr)
  end_pos = data.slice(start_pos + substr.length).indexOf('USD')
  return parseFloat(data.slice(start_pos + substr.length, start_pos + substr.length + end_pos))
}

window.onload = function(){
  fetch('https://www.bitcloutpulse.com/').then(function(response, body){
    response.text().then((data)=>{
      var $ = document.getElementById.bind(document)
      bitclout_price = get_token_price(data)
      $('price').innerHTML = '' + bitclout_price
      $('compute').onclick = function(){
        var x1 = 0, x2 = 0, y = 0;
        let current_token_price = parseFloat($('current_token_price').value.replace(',', '.'))
        if (current_token_price > 0) {
          y = current_token_price
          let coins_supply = (10 * Math.sqrt(10/3) * Math.sqrt(y)) / (Math.sqrt(bitclout_price))
          x1 = (0.001 * coins_supply**3) * bitclout_price
        }
        y = parseFloat($('expected_token_price').value.replace(',', '.'))
        let coins_supply = (10 * Math.sqrt(10/3) * Math.sqrt(y)) / (Math.sqrt(bitclout_price))
        x2 = (0.001 * coins_supply**3) * bitclout_price
        if (x2 <= x1) {
          alert('Expected token price should be larger than Current token price');
          return
        }

        $('out').value = '' + (x2 - x1).toFixed(2) //+ '$'
      }
    })
  })
}