import PixelDetailBoard from "./PixelDetailBoard";
import "./PixelDetail.css"


const PixelDetail = (props) =>
  <div className="pixel_popup">
    <PixelDetailBoard pixels={props.detailPixels}/>
    <br/><br/>
    <div className="pixel_info block">
      <div className="pixel_owner">
        <b>Owner: {props.info[0]}</b>
      </div>
      <div className="pixel_position">
        <b>Position: {props.pos}</b>
      </div>
      <div className="pixel_description">
          <b>Description: {props.info[1]}</b>
        </div>
    </div>
  </div>

export default PixelDetail;
