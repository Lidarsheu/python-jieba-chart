import gulp from 'gulp';
import sass from 'gulp-sass';
import uglify from 'gulp-uglify';
import connect from 'gulp-connect';
import browserify from 'browserify';
import babelify from 'babelify';
// 轉成 gulp 讀取的 vinyl（黑膠）流
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import sourcemaps from 'gulp-sourcemaps';
import gutil from 'gulp-util';
import image from 'gulp-image';

const dirs = {
  src: 'src',
  dest: 'static'
};

const stylesPaths = {
  src: `${dirs.src}/styles/*.scss`,
  dest: `${dirs.dest}/css`
};

const scriptsPaths = {
  src: `${dirs.src}/scripts/*.js`,
  dest: `${dirs.dest}/js`
};

const imagesPaths = {
  src: `${dirs.src}/images/*`,
  dest: `${dirs.dest}/img`
};

gulp.task('styles', () => {
  gulp.src(stylesPaths.src)
    .pipe(sass())         // 編譯 Scss
    .pipe(gulp.dest(stylesPaths.dest))  //
    .pipe(connect.reload());
});

gulp.task('scripts', function(){
    return browserify({
        entries: ['./src/scripts/main.js']
    })
    .transform(babelify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer()) // <----- convert from streaming to buffered vinyl file object
    .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(scriptsPaths.dest));
});

gulp.task('images', function() {
  gulp.src(imagesPaths.src)
    .pipe(image())
    .pipe(gulp.dest(imagesPaths.dest));
});

gulp.task('copy-html', function(){
  return gulp.src(`${dirs.src}/*.html`).pipe(gulp.dest(dirs.dest))
});

gulp.task('server', function () {
  connect.server({
    root: [dirs.dest],
    livereload: true,
    port: 7777,
  });
});

gulp.task('watch', function () {
  gulp.watch(stylesPaths.src, ['styles']);
  gulp.watch(scriptsPaths.src, ['scripts']);
});

gulp.task('default', ['copy-html', 'scripts', 'styles', 'images', 'server', 'watch']);
gulp.task('build', ['copy-html', 'scripts', 'styles', 'images']);
