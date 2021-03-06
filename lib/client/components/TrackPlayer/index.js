import React, {Component} from 'react';
import { Button, Col, Glyphicon, Grid, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import TrackForm from '../TrackForm/index';
import TasksApi from '../../api/tasksApi';
import { addTask } from '../../actions/taskActions';
import { fullRecordedTime } from '../../utils/time';
import { resetPlayerData } from '../../consts/track-player';

import './TrackPlayer.scss';


export class TrackPlayer extends Component {

  constructor (props) {
    super(props);
    this.state = resetPlayerData;
  }

  componentWillUnmount() {
    this.pauseTicking();
  }

  setCurrentTime() {
    this.setState((prevState) => {
      return {
        piece: {
          ...prevState.piece,
          end: new Date()
        }
      };
    });
  }

  handlePlayButton = () => {
    if (this.state.playing)
      this.pauseTicking();
    else
      this.startTicking();
  }
  startTicking() {
    this.setState({
      playing: true,
      piece: {
        start: new Date(),
        end: new Date() }
    });
    this.timer = setInterval(
      () => this.setCurrentTime(),
      1000
    );
  }
  pauseTicking() {
    if (!this.state.playing) return;
    this.setState( (prevState) => {
      return {
        playing: false,
        task: {
          ...prevState.task,
          pieces: [
            ...prevState.task.pieces,
            this.state.piece
          ]
        },
        piece: {
          start: new Date(),
          end: new Date()
        }
      };
    });
    clearInterval(this.timer);
    //@TODO update task piece
  }

  stopTracking = () => {
    this.pauseTicking();
    this.setState({ modal: { show: true }});
  }

  handleChange = (newValue) => {
    this.setState((prevState) => ({
      ...prevState,
      task: {
        ...prevState.task,
        description: newValue
      }
    }));
  }

  onSubmit = () => {
    TasksApi.post(this.state.task)
      .then((task) => {
        this.props.addTask(task);
        this.closeModal();
        this.resetPlayer();
      })
      .catch((err) => { console.log(err); });
  }

  closeModal = () => {
    this.setState({ modal: { show: false } });
  }

  resetPlayer() {
    this.setState(resetPlayerData);
  }


  render () {
    const diff = fullRecordedTime(this.state.task.pieces, this.state.piece);

    return (
      <React.Fragment>
        <Grid>
          <Row className="track-player show-grid">
            <Col xs={12} mdOffset={4} md={2}>
              <div className="track-player__buttons">
                <Button
                  bsSize="large"
                  bsStyle="success"
                  onClick={this.handlePlayButton}
                >
                  <Glyphicon glyph={this.state.playing ? 'pause' : 'play'} />
                </Button>
                <Button
                  bsSize="large"
                  bsStyle="danger"
                  disabled={diff === '00:00:00'} //@TODO need to refactor
                  onClick={this.stopTracking}
                >
                  <Glyphicon glyph="stop" />
                </Button>
              </div>
            </Col>
            <Col xs={12} md={2}>
              <h2>{diff}</h2>
            </Col>
          </Row>
        </Grid>
        <TrackForm
          handleChange={this.handleChange}
          onClose={this.closeModal}
          onSubmit={this.onSubmit}
          show={this.state.modal.show}
          task={this.state.task} />
      </React.Fragment>
    );
  }
}

function mapStateToProps (state) {
  return { task: state.task };
}

export default connect(mapStateToProps, { addTask })(TrackPlayer);