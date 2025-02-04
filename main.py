# from flask import Flask, render_template
# from flask_wtf import FlaskForm
# from wtforms import FileField, SubmitField
# from werkzeug.utils import secure_filename
# import os
# from wtforms.validators import InputRequired

# app = Flask(__name__)
# app.config['SECRET_KEY'] = 'supersecretkey'
# app.config['UPLOAD_FOLDER'] = 'static/uploadedFiles'

# class UploadFileForm(FlaskForm):
#     file = FileField('File', validators=[InputRequired()])
#     submit = SubmitField('Upload File')

# @app.route('/', methods=['GET', 'POST'])
# @app.route('/home', methods=['GET', 'POST'])
# def home():
#     uploadFileForm = UploadFileForm()
#     if uploadFileForm.validate_on_submit():
#         uploadFile = uploadFileForm.file.data
#         uploadFile.save(os.path.join(os.path.abspath(os.path.dirname(__file__)),app.config['UPLOAD_FOLDER'],secure_filename(uploadFile.filename)))
#         return 'File has been uploaded successfully'
#     return render_template('index.html', form=uploadFileForm)

# if __name__ == '__main__':
#     app.run(debug=True)