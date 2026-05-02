// This file contains generic, broadly usable icons
import googleIcon from './generic/google.svg';
import calendar from './generic/calendar.svg';
import dollar from './generic/dollar.svg';
import pieChart from './generic/pie-chart.svg';
import priceTag from './generic/price-tag.svg';
import writing from './generic/writing.svg';
import houseChimney from './generic/house-chimney.svg';
import wallet from './generic/wallet.svg';
import pieChart2 from './generic/chart-pie.svg';
import settings from './generic/settings.svg';
import angleLeft from './generic/angle-left.svg';
import angleRight from './generic/angle-right.svg';
import add from './generic/add.svg';
import circleXmark from './generic/circle-xmark.svg';
import bell from './generic/bell.svg';
import leftChevron from './generic/left-chevron.svg';
import cancel from './generic/cancel.svg';
import penCircle from './generic/pen-circle.svg';
import angleSmallRight from './generic/angle-small-right.svg';
import mail from './generic/mail.svg';
import creditCardPayment from './generic/credit-card-payment.svg';
import money from './generic/money.svg';
import stock from './generic/stock.svg';
import downArrow from './generic/down-arrow.svg';
import upArrow from './generic/up-arrow.svg';

/**
 * Mapping of generic icons with their respective sources and names.
 */

export const iconGenericMapping = [
  { id: 1, icon: 'google.svg', source: googleIcon, name: 'Google Icon' },
  { id: 2, icon: 'calendar.svg', source: calendar, name: 'Calendar Icon' },
  { id: 3, icon: 'dollar.svg', source: dollar, name: 'Dollar Icon' },
  { id: 4, icon: 'pie-chart.svg', source: pieChart, name: 'Pie Chart Icon' },
  { id: 5, icon: 'price-tag.svg', source: priceTag, name: 'Price Tag Icon' },
  { id: 6, icon: 'writing.svg', source: writing, name: 'Writing Icon' },
  { id: 7, icon: 'house-chimney.svg', source: houseChimney, name: 'House Chimney Icon' },
  { id: 8, icon: 'wallet.svg', source: wallet, name: 'Wallet Icon' },
  { id: 9, icon: 'chart-pie.svg', source: pieChart2, name: 'Pie Chart 2 Icon' },
  { id: 10, icon: 'settings.svg', source: settings, name: 'Settings Icon' },
  { id: 11, icon: 'angle-left.svg', source: angleLeft, name: 'Angle Left Icon' },
  { id: 12, icon: 'angle-right.svg', source: angleRight, name: 'Angle Right Icon' },
  { id: 13, icon: 'add.svg', source: add, name: 'Add Icon' },
  { id: 14, icon: 'circle-xmark.svg', source: circleXmark, name: 'Circle X Mark Icon' },
  { id: 15, icon: 'bell.svg', source: bell, name: 'Bell Icon' },
  { id: 16, icon: 'left-chevron.svg', source: leftChevron, name: 'Left Chevron Icon' },
  { id: 17, icon: 'cancel.svg', source: cancel, name: 'Cancel Icon' },
  { id: 18, icon: 'mail.svg', source: mail, name: 'Mail Icon'},
  { id: 19, icon: 'pen-circle.svg', source: penCircle, name: 'Pen Circle Icon'},
  { id: 20, icon: 'angle-small-right', source: angleSmallRight, name: 'Angle Small Right Icon'},
  { id: 21, icon: 'credit-card-payment.svg', source: creditCardPayment, name: 'Credit Card Payment Icon' },
  { id: 22, icon: 'money.svg', source: money, name: 'Money Icon' },
  { id: 23, icon: 'stock.svg', source: stock, name: 'Stock Icon' },
  { id: 24, icon: 'down-arrow.svg', source: downArrow, name: 'Down Arrow Icon' },
  { id: 25, icon: 'up-arrow.svg', source: upArrow, name: 'Up Arrow Icon' },
];

/**
 * Retrieves category icons based on the provided name.
 * @param id The provided id (e.g., 'Google Icon').
 * @returns An array of icon objects that use the specified name.
 */

export const getGenericIcon = (name: string) => {
  return iconGenericMapping.filter(f => f.name === name);
};
