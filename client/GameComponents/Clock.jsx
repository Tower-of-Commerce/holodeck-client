import React from 'react';
import PropTypes from 'prop-types';

const formattedSeconds = (sec) => (sec <= 0 ? '-' : '') + Math.floor(Math.abs(sec) / 60) + ':' + ('0' + Math.abs(sec) % 60).slice(-2);

class Clock extends React.Component {
    constructor() {
        super();

        this.state = { timeLeft: 0, periods: 0, mainTime: 0, timePeriod: 0, delayToStartClock: 0, manuallyPaused: false };
    }

    componentWillReceiveProps(newProps) {
        if(newProps.secondsLeft === 0 || this.stateId === newProps.stateId) {
            return;
        }
        this.stateId = newProps.stateId;
        this.setState({
            timeLeft: newProps.secondsLeft,
            periods: newProps.periods,
            mainTime: newProps.mainTime,
            timePeriod: newProps.timePeriod,
            manuallyPaused: newProps.manuallyPaused,
            delayToStartClock: newProps.delayToStartClock
        });

        if(this.timerHandle) {
            clearInterval(this.timerHandle);
        }

        if(newProps.mode !== 'stop' && !newProps.manuallyPaused) {
            this.timerHandle = setInterval(() => {
                if(this.state.delayToStartClock > 0) {
                    this.setState({ delayToStartClock: this.state.delayToStartClock - 1 });
                } else {
                    this.setState({
                        timeLeft: this.state.timeLeft + (newProps.mode === 'up' ? 1 : -1)
                    });
                }
            }, 1000);
        }
    }

    getFormattedClock() {
        let delaySeconds = '';
        if(typeof this.state.delayToStartClock === 'number') {
            delaySeconds = this.state.delayToStartClock > 0 ? formattedSeconds(this.state.delayToStartClock) : '0:00';
        }
        if(!this.state.periods || this.state.timeLeft <= 0) {
            if(delaySeconds) {
                return `${formattedSeconds(this.state.timeLeft)}(${delaySeconds})`;
            }
            return `${formattedSeconds(this.state.timeLeft)}`;
        }
        let stage = '';
        let timeLeftInPeriod = 0;
        if(this.state.timeLeft > this.state.periods * this.state.timePeriod) {
            stage = 'M';
            timeLeftInPeriod = this.state.timeLeft - this.state.periods * this.state.timePeriod;
        } else {
            stage = Math.ceil(this.state.timeLeft / this.state.timePeriod);
            if(stage === 1) {
                stage = 'SD';
            }
            timeLeftInPeriod = this.state.timeLeft % this.state.timePeriod === 0 ?
                this.state.timePeriod :
                this.state.timeLeft % this.state.timePeriod;
        }
        return `${formattedSeconds(timeLeftInPeriod)} (${stage})`;
    }

    render() {
        let className = 'player-stats-row state clock';
        if(this.props.mode !== 'stop') {
            className += ' clock-active';
        }
        return (
            <div className={ className }>
                <span>
                    <img src='/img/free-clock-icon-png.png' className='clock-icon' />
                </span>
                { this.getFormattedClock() }
            </div>
        );
    }
}

Clock.displayName = 'Clock';
Clock.propTypes = {
    delayToStartClock: PropTypes.number,
    mainTime: PropTypes.number,
    manuallyPaused: PropTypes.bool,
    mode: PropTypes.string,
    periods: PropTypes.number,
    secondsLeft: PropTypes.number,
    stateId: PropTypes.number,
    timePeriod: PropTypes.number
};

export default Clock;
