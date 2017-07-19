import moment from 'moment';
import { isBrowser } from './browser';
import { getFeedbackStorage, setFeedbackStorage } from '../store/localStorage';

function updateStorage(updates) {
  setFeedbackStorage({ ...getFeedbackStorage(), ...updates });
}

const shouldDisplayPopup = time => {
  if (isBrowser) {
    const NOW = moment(time);
    if (getFeedbackStorage().appUseStarted === undefined) {
      // initialize localstorage if needed
      updateStorage({
        feedbackInteractionDate: 0,
        appUseStarted: NOW.valueOf(),
      });
    }

    const appInUseDays = NOW.diff(
      moment(getFeedbackStorage().appUseStarted),
      'days',
    );
    const lastFeedbackDays = NOW.diff(
      moment(getFeedbackStorage().feedbackInteractionDate),
      'days',
    );

    if (appInUseDays >= 2 && lastFeedbackDays > 30) {
      return true;
    }
  }
  return false;
};

const recordResult = (piwik, time, nps, preferNew, feedback) => {
  updateStorage({ feedbackInteractionDate: time });

  if (nps !== undefined) {
    piwik.setCustomVariable(1, 'nps', nps, 'visit');
    piwik.trackEvent('Feedback', 'Set', 'nps', nps);
  }

  if (preferNew !== undefined) {
    piwik.setCustomVariable(2, 'prefer_new', preferNew, 'visit');
    piwik.trackEvent('Feedback', 'Set', 'prefer_new', preferNew);
  }

  if (feedback) {
    piwik.setCustomVariable(3, 'feedback', feedback, 'visit');
    piwik.trackEvent('Feedback', 'Set', 'feedback', feedback);
  }

  if (nps !== undefined || preferNew !== undefined || feedback !== undefined) {
    piwik.trackEvent('Feedback', 'Close');
  }
};

export { shouldDisplayPopup, recordResult };
