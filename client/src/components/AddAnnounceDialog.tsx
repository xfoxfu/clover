import * as React from 'react';
import { inject, observer } from 'mobx-react';
import AppState from '../lib/state';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import { ChangeEvent } from 'react';
import { CircularProgress } from 'material-ui/Progress';
import theme from '../lib/theme';

@inject('state') @observer
class FormDialog extends React.Component<{
  state: AppState
}, {
  open: boolean,
  title: string;
  content: string;
  loading: boolean;
}> {
  state = {
    open: false,
    title: '',
    content: '',
    loading: false,
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };
  handleClose = () => {
    const { title, content } = this.state;
    this.setState({ loading: true });
    this.props.state.addAnnounce(title, content)
      .then(() => this.setState({
        open: false,
        title: '',
        content: '',
        loading: false
      }))
      .catch((err) => {
        this.setState({ loading: false });
        this.props.state.emitError(err)
      });
  };
  simpleClose = () => {
    this.setState({ open: false });
  }
  handleChange = (name: string) => (event: ChangeEvent<{ value: string }>) => {
    this.setState({
      ...this.state,
      [name]: event.target.value,
    });
  }

  render() {
    const { loading } = this.state;
    return (
      <span>
        <Button
          onClick={this.handleClickOpen}
          color="secondary"
          style={{ margin: theme.spacing.unit }}
        >创建公告</Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">创建公告</DialogTitle>
          <DialogContent>
            <DialogContentText>
              将会自动发送邮件给已激活邮箱的用户。
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="title"
              label="标题"
              type="text"
              fullWidth
              onChange={this.handleChange('title')}
            />
            <TextField
              multiline
              margin="dense"
              id="content"
              label="正文（支持 Markdown）"
              type="text"
              fullWidth
              onChange={this.handleChange('content')}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.simpleClose} color="secondary">
              取消
            </Button>
            <div style={{ position: 'relative', }}>
              <Button
                onClick={this.handleClose}
                color="secondary"
                disabled={loading}
              >
                提交
             </Button>
              {loading && <CircularProgress />}
            </div>
          </DialogActions>
        </Dialog >
      </span>
    );
  }
}
export default FormDialog;
