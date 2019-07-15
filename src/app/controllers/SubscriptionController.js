/**
 * @author Rodrigo Figueiredo
 * @since  12/07/2019
 */
import { Op } from 'sequelize';
import User from '../models/User';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';
import Queue from '../../lib/Queue';
import SubscriptionMail from '../jobs/SubscriptionMail';

class SubscriptionController {
  async index(req, res) {
    const user_id = req.userId;

    const subscriptions = await Subscription.findAll({
      where: {
        user_id,
      },
      include: [
        {
          model: Meetup,
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
          required: true,
        },
      ],
      order: [[Meetup, 'date']],
    });

    return res.json(subscriptions);
  }

  async store(req, res) {
    const user_id = req.userId;
    const user = await User.findByPk(user_id);
    const meetup = await Meetup.findByPk(req.params.meetup_id, {
      include: [User],
    });

    if (meetup.user_id === user_id) {
      return res.status(400).json({ error: 'User not eligible' });
    }

    if (meetup.past) {
      return res.status(400).json({ error: 'Meetup has finished' });
    }

    const checkSubscription = await Subscription.findOne({
      where: {
        user_id,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (checkSubscription) {
      return res
        .status(400)
        .json({ error: 'You have a meetup in this period' });
    }

    const subscription = await Subscription.create({
      user_id,
      meetup_id: meetup.id,
    });

    await Queue.add(SubscriptionMail.key, {
      meetup,
      user,
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
