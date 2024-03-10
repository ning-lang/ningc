// ## Looks

resize canvas to width #() height #();
draw image ^() at x #() y #() with width #() height #();

// ## Control

if %() !();
if %() !(); else !();
while %() !();
repeat until %() !();
forever %() !();

// ## Variables

let #[] = #();
let $[] = $();
let %[] = %();
var #[] = #();
var $[] = $();
var %[] = %();
set #[] to #();
set $[] to $();
set %[] to %();
change #[] by #();

create number list ##[];
create string list $$[];
create boolean list %%[];

length of ##[];
length of $$[];
length of %%[];

// If a list index is invalid, returns the default value (0, "", or false, respectively).
item #() of ##[];
item #() of $$[];
item #() of %%[];

// If the item is not in the list, returns -1.
index of #() in ##[];
index of $() in $$[];
index of %() in %%[];

##[] contains #()?;
$$[] contains $()?;
%%[] contains %()?;

// If a list index is invalid, the operation is a no-op.
replace item #() of ##[] with #();
replace item #() of $$[] with $();
replace item #() of %%[] with %();
insert #() at #() of ##[];
insert $() at #() of $$[];
insert %() at #() of %%[];
delete item #() of ##[];
delete item #() of $$[];
delete item #() of %%[];
delete all of ##[];
delete all of $$[];
delete all of %%[];
add #() to ##[];
add $() to $$[];
add %() to %%[];

// ## Operators

#() + #();
#() - #();
#() * #();
#() / #();
#() mod #();
#() to the power of #();

#() == #();
#() != #();
#() < #();
#() <= #();
#() > #();
#() >= #();

exp #();
ln #();
sin of #() degrees;
cos of #() degrees;
tan of #() degrees;
asin degrees of #();
acos degrees of #();
atan degrees of #();
sin of #() radians;
cos of #() radians;
tan of #() radians;
asin radians of #();
acos radians of #();
atan radians of #();
pi;
NaN;
Infinity;
-Infinity;

floor #();
ceiling #();
round #();
abs #();
min of #() and #();
max of #() and #();
clamp #() between #() and #();

%() and %();
%() or %();
not %();

$() ++ $();
length of $();
letter #() of $();
substring of $() from #() to #();
$() contains $()?;
index of $() in $();

if %() then #() else #();
if %() then $() else $();
if %() then %() else %();

// Returns NaN if parsing fail
parse $() as number;

convert #() to string;
convert %() to string;

can $() be parsed as a number?;
can $() be parsed as a real number?;
can $() be parsed as an integer?;

// ## Sensing

screen mouse x;
screen mouse y;
canvas mouse x;
canvas mouse y;
mouse down?;

screen width;
screen height;
canvas width;
canvas height;

milliseconds since unix epoch;
current year;
current month;
current date;
// Sunday is 0, Saturday is 6
current day of the week;
current hour;
current minute;
current second;

key ^() pressed?;

// ## Sigil explanation
//
// `#` Number
//
// `##` Number list
//
// `$` String
//
// `$$` String list
//
// `^` Static String
//
// `%` Boolean
//
// `%%` Boolean list
//
// `!` Function
