import React, { Component } from 'react'
import { Card, Button, Form, Icon, Col, Row, DatePicker, TimePicker, Input, Select, Popover,Switch } from 'antd'
import { connect } from 'dva'
import PageHeaderLayout from '../../layouts/PageHeaderLayout'
import CandidateList from '../../components/CandidateList'
import {ImageComponent} from '../../axios/tools'
import FooterToolbar from '../../components/FooterToolbar'
import styles from './Section.createform.less'
import {mapBackToImageValues, mapFromImageValues} from '../../axios/tools'
import GlobalComponents from '../../custcomponents';
import SectionBase from './Section.base'
import appLocaleName from '../../common/Locale.tool'
const { Option } = Select
const { RangePicker } = DatePicker
const { TextArea } = Input
const {fieldLabels} = SectionBase
const testValues = {};
import PrivateImageEditInput from '../../components/PrivateImageEditInput'
import RichEditInput from '../../components/RichEditInput'
import SmallTextInput from '../../components/SmallTextInput'

const imageKeys = [
  'icon',
]


class SectionCreateFormBody extends Component {
  state = {
    previewVisible: false,
    previewImage: '',
    convertedImagesValues: {},
  }

  componentDidMount() {



    const {initValue} = this.props
    if(!initValue || initValue === null){
      return
    }

    const formValue = SectionBase.unpackObjectToFormValues(initValue)
    this.props.form.setFieldsValue(formValue);




  }

  handlePreview = (file) => {
    console.log('preview file', file)
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    })
  }




  handleImageChange = (event, source) => {

    const {handleImageChange} = this.props
    if(!handleImageChange){
      console.log('FAILED GET PROCESS FUNCTION TO HANDLE IMAGE VALUE CHANGE', source)
      return
    }

    const { convertedImagesValues } = this.state
    const { fileList } = event
    convertedImagesValues[source] = fileList
    this.setState({ convertedImagesValues })
    handleImageChange(event, source)


  }


  render() {
    const { form, dispatch, submitting, role } = this.props
    const { convertedImagesValues } = this.state
	const userContext = null
    const { getFieldDecorator, validateFieldsAndScroll, getFieldsError } = form
    const { owner } = this.props
    const {SectionService} = GlobalComponents

    const capFirstChar = (value)=>{
    	//const upper = value.replace(/^\w/, c => c.toUpperCase());
  		const upper = value.charAt(0).toUpperCase() + value.substr(1);
  		return upper
  	}
    

    const tryinit  = (fieldName) => {

      if(!owner){
      	return null
      }
      const { referenceName } = owner
      if(referenceName!=fieldName){
        return null
      }
      return owner.id
    }

    const availableForEdit= (fieldName) =>{

      if(!owner){
      	return true
      }
      const { referenceName } = owner
      if(referenceName!=fieldName){
        return true
      }
      return false

    }
	const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 12 },
    }
    const switchFormItemLayout = {

      labelCol: { span: 6 },
      wrapperCol: { span: 12 },

    }

    const internalRenderTitle = () =>{
      const linkComp=<a onClick={goback}  > <Icon type="double-left" style={{marginRight:"10px"}} /> </a>
      return (<div>{linkComp}{appLocaleName(userContext,"CreateNew")}{window.trans('section')}</div>)
    }

	return (
      <div>
        <Card title={!this.props.hideTitle&&appLocaleName(userContext,"BasicInfo")} className={styles.card} bordered={false}>
          <Form >
          	<Row gutter={16}>


              <Col lg={24} md={24} sm={24}>
                <Form.Item label={fieldLabels.title} {...formItemLayout}>
                  {getFieldDecorator('title', {
                    rules: [{ required: true, message: appLocaleName(userContext,"PleaseInput") }],
                  })(
                    <SmallTextInput minLength={1} maxLength={40} size="large"  placeholder={fieldLabels.title} />
                  )}
                </Form.Item>
              </Col>

              <Col lg={24} md={24} sm={24}>
                <Form.Item label={fieldLabels.brief} {...formItemLayout}>
                  {getFieldDecorator('brief', {
                    rules: [{ required: true, message: appLocaleName(userContext,"PleaseInput") }],
                  })(
                    <SmallTextInput minLength={0} maxLength={200} size="large"  placeholder={fieldLabels.brief} />
                  )}
                </Form.Item>
              </Col>

              <Col lg={24} md={24} sm={24}>
                <Form.Item label={fieldLabels.displayOrder} {...formItemLayout}>
                  {getFieldDecorator('displayOrder', {
                    rules: [{ required: true, message: appLocaleName(userContext,"PleaseInput") }],
                  })(
                    <SmallTextInput minLength={0} maxLength={10000} size="large"  placeholder={fieldLabels.displayOrder} />
                  )}
                </Form.Item>
              </Col>

              <Col lg={24} md={24} sm={24}>
                <Form.Item label={fieldLabels.viewGroup} {...formItemLayout}>
                  {getFieldDecorator('viewGroup', {
                    rules: [{ required: true, message: appLocaleName(userContext,"PleaseInput") }],
                  })(
                    <SmallTextInput minLength={0} maxLength={40} size="large"  placeholder={fieldLabels.viewGroup} />
                  )}
                </Form.Item>
              </Col>

              <Col lg={24} md={24} sm={24}>
                <Form.Item label={fieldLabels.linkToUrl} {...formItemLayout}>
                  {getFieldDecorator('linkToUrl', {
                    rules: [{ required: true, message: appLocaleName(userContext,"PleaseInput") }],
                  })(
                    <SmallTextInput minLength={0} maxLength={512} size="large"  placeholder={fieldLabels.linkToUrl} />
                  )}
                </Form.Item>
              </Col>



 
              <Col lg={24} md={24} sm={24} >
                <Form.Item label={fieldLabels.page} {...formItemLayout}>
                  {getFieldDecorator('pageId', {
                  	initialValue: tryinit('page'),
                    rules: [{ required: true, message: appLocaleName(userContext,"PleaseInput") }],
                  })(


                  <CandidateList
		                 disabled={!availableForEdit('page')}
		                 ownerType={owner.type}
		                 ownerId={owner.id}
		                 scenarioCode={"assign"}
		                 listType={"section"}
		                 targetType={"page"}

                    requestFunction={SectionService.queryCandidates}  />



                  )}
                </Form.Item>
              </Col>





			 </Row>
          </Form>
        </Card>






       <Card title={<div>{appLocaleName(userContext,"Attachment")} <Popover title={appLocaleName(userContext,"ScanQRCodetoUploadfromSmartPhone")} content={<div><img src='./qrtest.png'/></div>}><Icon type="qrcode" ></Icon></Popover></div>} className={styles.card} bordered={false}>
          <Form >
            <Row gutter={16}>


          <Col lg={6} md={6} sm={6}></Col>
          <Col lg={12} md={12} sm={12}>
              <Form.Item>
                  {getFieldDecorator('icon', {
                    rules: [{  required: false, message: appLocaleName(userContext,"PleaseInput") }],
                  })(
               <PrivateImageEditInput buttonTitle={fieldLabels.icon}/>
                )} </Form.Item>

              </Col><Col lg={6} md={6} sm={6}></Col>

             </Row>
          </Form>
        </Card>





       </div>
    )
  }
}

export default connect(state => ({
  collapsed: state.global.collapsed,
}))(Form.create()(SectionCreateFormBody))





