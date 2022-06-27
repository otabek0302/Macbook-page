//Variable
let color_btns = document.querySelectorAll('.color_mac_item')
let img = document.querySelector('img')
let source = document.querySelector('source')
color_btns.forEach(element => {
     element.onclick = () => {
          color_btns.forEach(item => item.classList.remove('active_btn'))
          let color = element.getAttribute('data-color')
          img.setAttribute('src', image[color])
          source.setAttribute('srcset', image[color])
          element.classList.add('active_btn')
     }
});


//Image 
let image = {
     white: "img/white.png",
     grey: "img/space-grey.png"
}





//Price
let btns = document.querySelectorAll('.memory_mac_item')
let price = document.querySelector('#price')
let orgPrice = 1999
price.innerHTML = `$${orgPrice}`;

btns.forEach(btn => {
     btn.onclick = () => {
          btns.forEach(item => item.classList.remove('active_border'))

          let adPrice = +btn.getAttribute('data-price')

          let temp = orgPrice + adPrice

          temp = String(temp);

          price.innerHTML = `$${ temp[0] }, ${ temp.slice(1) }`
          btn.classList.add('active_border')
     }
});