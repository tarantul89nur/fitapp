var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var autoprefixer = require("gulp-autoprefixer");
var gcmq = require('gulp-group-css-media-queries');
var csso = require('gulp-csso');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var run = require('run-sequence');
var del = require('del');
var server = require("browser-sync");

gulp.task("clean", function() {
  return del("build");
});

gulp.task("copy-fonts", function() {
  return gulp.src("src/fonts/**/*.{woff,woff2}", {base: "src/fonts"})
  .pipe(gulp.dest("build/fonts"));
});

gulp.task('copy-css', function() {
    return gulp.src("src/css/**/*.*", {base: "src/css"})
      .pipe(gulp.dest('build/css'))
      .pipe(rename({suffix: '--min'}))
      .pipe(csso())
      .pipe(gulp.dest('build/css'))
      .pipe(server.reload({stream: true}))
});

gulp.task("copy-img", function() {
  return gulp.src("src/img/**/*.*", {base: "src/img"})
    .pipe(gulp.dest("build/img"))
    .pipe(server.reload({stream: true}));
});

gulp.task("copy-js", function() {
  return gulp.src("src/js/**/*.*", {base: "src/js"})
    .pipe(gulp.dest("build/js"))
    .pipe(rename({suffix: "--min"}))
    .pipe(uglify())
    .pipe(gulp.dest('build/js'))
    .pipe(server.reload({stream: true}));
});

gulp.task("copy-html", function() {
  return gulp.src("src/*.html")
    .pipe(gulp.dest("build"))
    .pipe(server.reload({stream: true}));
});

gulp.task("style", function() {
  gulp.src("src/less/**/*.*")
    .pipe(plumber())
    .pipe(less())
    .pipe(autoprefixer({
      browsers: [
        "last 1 version",
        "last 2 Chrome versions",
        "last 2 Firefox versions",
        "last 2 Opera versions",
        "last 2 Edge versions"
      ],
      cascade: false
    }))
    .pipe(gcmq())
    .pipe(gulp.dest("build/css"))
    .pipe(rename({suffix: "--min"}))
    .pipe(csso())
    .pipe(gulp.dest("build/css"))
    .pipe(server.reload({stream: true}));
});

gulp.task("images", function() {
  return gulp.src("build/img/**/*.{png,jpg,gif}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
    ]))
    .pipe(gulp.dest("build/img"))
});

gulp.task("serve", function() {
  server.init({
    server: "build"
  });

  gulp.watch("src/less/**/*.less", ["style"]);
  gulp.watch('src/*.html', ['copy-html']);
  gulp.watch('src/css/**/*', ['copy-css']);
  gulp.watch('src/img/**/*', ['copy-img']);
  gulp.watch('src/fonts/**/*', ['copy-fonts']);
  gulp.watch('src/js/**/*', ['copy-js']);
});

gulp.task("build", function(fn) {
  run("clean", ["copy-fonts", "copy-css", "copy-js", "copy-img", "copy-html"], "style", "images", fn);
});
