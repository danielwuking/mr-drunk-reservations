function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;} // Variables
const reservationsURL = 'https://mr-drunk-backend.firebaseio.com/reservations.json';
const reservationURL = id => `https://mr-drunk-backend.firebaseio.com/reservations/${id}.json`;
let existingLargestId = 0;

// Renders
$(document).ready(function () {
  loadReservations();
});

// 從server獲得訂位結果，丟到下面render
const loadReservations = () => {
  $.get(reservationsURL, results => {
    _.values(results).forEach(res => {
      existingLargestId = Math.max(res.ReservationId, existingLargestId);
    });
    renderReservations(results);
  });
};

// _.pairs把diction的key跟value變成長度是2的陣列
const renderReservations = results => {
  ReactDOM.render(React.createElement(Reservations, { results: _.pairs(results) }), document.getElementById('reservations'));
};

// Components
// 將新訂位資料做成lists
class Reservations extends React.PureComponent {
  render() {
    let lists = [];
    this.props.results.forEach(result => {
      const id = result[0];
      const res = result[1];
      if (!res.Deleted && Date.parse(res.DateTime) >= Date.now()) lists.push(React.createElement(Reservation, { res: res, id: id }));
    });
    return (
      lists);

  }}


// 按下確認訂單後，將刪除改成true
class Reservation extends React.PureComponent {constructor(...args) {super(...args);_defineProperty(this, "confirmReservationCompletion",
    () => {
      console.log(this.props.id);
      if (confirm('確定要完成訂單嗎？')) {
        $.ajax({
          url: reservationURL(this.props.id),
          type: 'PATCH',
          data: JSON.stringify({ Deleted: true }),
          contentType: "application/json; charset=utf-8",
          dataType: "json",
          success: () => loadReservations() });

      }
    });}
  render() {
    if (this.props.res.Deleted) return;
    return (
      React.createElement("a", { class: "resvervation collection-item", onClick: this.confirmReservationCompletion },
      React.createElement("div", { class: "customer-name" }, this.props.res.CustomerName),
      React.createElement("div", { class: "customer-amount" }, this.props.res.CustomerAmount, "\u4F4D"),
      React.createElement("div", { class: "table-type" }, this.props.res.TableType == 'big' ? '大桌' : '小桌'),
      React.createElement("div", { class: "customer-date" }, this.props.res.DateTime)));


  }}


const resetErrorMessage = () => {
  $('#customer-name-error').text('');
  $('#customer-name').removeClass('error-input');
  $('#customer-amount-error').text('');
  $('#customer-amount').removeClass('error-input');
  $('#customer-date-error').text('');
  $('#customer-date').removeClass('error-input');
};

// 檢驗資料正不正確，如果錯誤就顯示錯誤訊息
const validate = formData => {
  resetErrorMessage();
  const name = formData.get('CustomerName');
  const amount = formData.get('CustomerAmount');
  let res = Date.parse(formData.get('DateTime'));
  console.log(res);
  let validData = true;
  if (name == "") {
    $('#customer-name-error').text('報上名來');
    $('#customer-name').addClass('error-input');
    validData = false;
  }
  if (amount <= 0 || amount >= 20) {
    $('#customer-amount-error').text('人數應該介於1-20間');
    $('#customer-amount').addClass('error-input');
    validData = false;
  }
  if (isNaN(res)) {
    $('#customer-date-error').text('訂位不寫時間是在哈囉？');
    $('#customer-date').addClass('error-input');
    validData = false;
  }
  if (res <= Date.now()) {
    $('#customer-date-error').text('你回到過去？');
    $('#customer-date').addClass('error-input');
    validData = false;
  }
  return validData;
};

const formDataToObject = formData => {
  var object = {};
  formData.forEach((value, key) => {object[key] = value;});
  const now = new Date();
  object.TimeStamp = now.toString();
  object.ReservationId = existingLargestId + 1;
  return object;
};

// 只要按下submit，就會將表單資料送到DB
const form = document.getElementById("reservation-form");
form.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(form);
  if (!validate(formData)) return;

  $.ajax({
    url: reservationsURL,
    type: "POST",
    data: JSON.stringify(formDataToObject(formData)),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: () => {
      loadReservations();
      document.getElementById("reservation-form").reset();
    } });

});

// JS variable declaration:
// var, let, const
// let -> muttable
// const -> immutable