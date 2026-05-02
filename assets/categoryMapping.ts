// This file contains a mapping of category icons to their respective IDs.
import question from './categories/000-question.svg';
import badminton from './categories/001-badminton.svg';
import boxingglove from './categories/002-boxing glove.svg';
import money from './categories/003-money.svg';
import capsules from './categories/004-capsules.svg';
import gamepad from './categories/005-gamepad.svg';
import train from './categories/006-train.svg';
import electricbus from './categories/007-electric bus.svg';
import basketball from './categories/008-basketball.svg';
import fishfood from './categories/009-fish food.svg';
import dumbbell from './categories/010-dumbbell.svg';
import movie from './categories/011-movie.svg';
import dog from './categories/012-dog.svg';
import footballfield from './categories/013-football field.svg';
import cycling from './categories/014-cycling.svg';
import martialarts from './categories/015-martial arts.svg';
import income from './categories/016-income.svg';
import cryptocurrency from './categories/018-cryptocurrency.svg';
import gasstation from './categories/019-gas station.svg';
import cat from './categories/020-cat.svg';
import hospital from './categories/021-hospital.svg';
import car from './categories/022-car.svg';
import bargraph from './categories/023-bar graph.svg';
import bandaid from './categories/024-band aid.svg';
import agent from './categories/025-agent.svg';
import beer from './categories/026-beer.svg';
import bill from './categories/027-bill.svg';
import birthdaycake from './categories/028-birthday-cake.svg';
import coffee from './categories/029-coffee.svg';
import gift from './categories/030-gift.svg';
import insurance from './categories/031-insurance.svg';
import lifestyle from './categories/032-lifestyle.svg';
import noodles from './categories/033-noodles.svg';
import onlineshop from './categories/034-online shop.svg';
import pie from './categories/035-pie.svg';
import piggybank from './categories/036-piggy bank.svg';
import shoppingbag from './categories/037-shopping bag.svg';
import gasStation from './categories/038-gas station.svg';
import lettuce from './categories/039-lettuce.svg';

export const categoryMapping = [
  { id: 1, icon: '001-badminton.svg', source: badminton, name: 'Badminton' },
  { id: 2, icon: '002-boxing glove.svg', source: boxingglove, name: 'Boxing Glove' },
  { id: 3, icon: '003-money.svg', source: money, name: 'Money' },
  { id: 4, icon: '004-capsules.svg', source: capsules, name: 'Capsules' },
  { id: 5, icon: '005-gamepad.svg', source: gamepad, name: 'Gamepad' },
  { id: 6, icon: '006-train.svg', source: train, name: 'Train' },
  { id: 7, icon: '007-electric bus.svg', source: electricbus, name: 'Electric Bus' },
  { id: 8, icon: '008-basketball.svg', source: basketball, name: 'Basketball' },
  { id: 9, icon: '009-fish food.svg', source: fishfood, name: 'Fish Food' },
  { id: 10, icon: '010-dumbbell.svg', source: dumbbell, name: 'Dumbbell' },
  { id: 11, icon: '011-movie.svg', source: movie, name: 'Movie' },
  { id: 12, icon: '012-dog.svg', source: dog, name: 'Dog' },
  { id: 13, icon: '013-football field.svg', source: footballfield, name: 'Football Field' },
  { id: 14, icon: '014-cycling.svg', source: cycling, name: 'Cycling' },
  { id: 15, icon: '015-martial arts.svg', source: martialarts, name: 'Martial Arts' },
  { id: 16, icon: '016-income.svg', source: income, name: 'Income' },
  { id: 17, icon: '017-dog.svg', source: dog, name: 'Dog 2' },
  { id: 18, icon: '018-cryptocurrency.svg', source: cryptocurrency, name: 'Cryptocurrency' },
  { id: 19, icon: '019-gas station.svg', source: gasstation, name: 'Gas Station' },
  { id: 20, icon: '020-cat.svg', source: cat, name: 'Cat' },
  { id: 21, icon: '021-hospital.svg', source: hospital, name: 'Hospital' },
  { id: 22, icon: '022-car.svg', source: car, name: 'Car' },
  { id: 23, icon: '023-bar graph.svg', source: bargraph, name: 'Bar Graph' },
  { id: 24, icon: '024-band aid.svg', source: bandaid, name: 'Band Aid' },
  { id: 25, icon: '025-agent.svg', source: agent, name: 'Agent' },
  { id: 26, icon: '026-beer.svg', source: beer, name: 'Beer' },
  { id: 27, icon: '027-bill.svg', source: bill, name: 'Bill' },
  { id: 28, icon: '028-birthday-cake.svg', source: birthdaycake, name: 'Birthday Cake' },
  { id: 29, icon: '029-coffee.svg', source: coffee, name: 'Coffee' },
  { id: 30, icon: '030-gift.svg', source: gift, name: 'Gift' },
  { id: 31, icon: '031-insurance.svg', source: insurance , name: 'Insurance' },
  { id: 32, icon: '032-lifestyle.svg', source: lifestyle, name: 'Lifestyle' },
  { id: 33, icon: '033-noodles.svg', source: noodles, name: 'Noodles' },
  { id: 34, icon: '034-online shop.svg', source: onlineshop, name: 'Online Shop' },
  { id: 35, icon: '035-pie.svg', source: pie, name: 'Pie' },
  { id: 36, icon: '036-piggy bank.svg', source: piggybank, name: 'Piggy Bank' },
  { id: 37, icon: '037-shopping bag.svg', source: shoppingbag, name: 'Shopping Bag' },
  { id: 38, icon: '038-gas station.svg', source: gasStation, name: 'Gas Station'},
  { id: 39, icon: '039-lettuce.svg', source: lettuce, name: 'Lettuce'}
];

/**
 * Retrieves category icons based on the provided id.
 * @param id The provided id (e.g., '1', '2').
 * @returns An array of icon objects that use the specified id.
 */
export const getIconsById = (id: number) => {
  return categoryMapping.filter(f => f.id === id);
};

/**
 * Example usage:
 * const Icon = getIconsById(1);
 * The following icons belong to default categories
 * { id: 27, icon: '027-bill.svg', ...} ---> Utility Bills
 * { id: 14, icon: '014-cycling.svg', ...} ---> Leisure Activities
 * { id: 39, icon: '039-lettuce.svg', ...} ---> Grocery
 * { id: 38, icon: '038-gas station.svg', ...} ---> Transportation
 * { id: 25, icon: '025-agent.svg', ...} ---> Rent
 * { id: 16, icon: '016-income.svg', ...} ---> Salary
 */

/** Extra: Icon for uncategorized category
 *  This icon is used when a transaction does not fit into any predefined category.
 *  Example usage:
 *  const uncategorizedIcon = getUncategorizedIcon();
 *  This will return the question mark icon (svg format).
*/

export const getUncategorizedIcon = () => question;